<script lang="ts">
  import { HubConnectionBuilder } from '@microsoft/signalr';
  import { onMount, untrack } from 'svelte';

  import type {
    ResourceRecordMatchDto,
    SongMatchDto,
    SongSubmissionMatchDto,
  } from '$lib/api/submission';

  import { page } from '$app/state';
  import { PUBLIC_API_BASE } from '$env/static/public';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import ResourceRecord from '$lib/components/ResourceRecord.svelte';
  import SongSubmissionForm from '$lib/components/SongSubmissionForm.svelte';
  import type { ChartBundle } from '$lib/types';
  import WaveSurfer from 'wavesurfer.js';
  import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';
  import ChartSubmissionForm from '$lib/components/ChartSubmissionForm.svelte';

  interface InputResponseMessage {
    type: 'inputResponse';
    payload: {
      bundlesResolved: number;
    };
  }

  interface ChartBundleMessage {
    type: 'bundle';
    payload: ChartBundle;
  }

  interface FileOutputMessage {
    type: 'fileOutput';
    payload: {
      purpose: 'adjustedOffset' | 'recordedVideo';
      file: File;
    };
  }

  interface EventMessage {
    type: 'event';
    payload: {
      name:
        | 'ready'
        | 'errored'
        | 'started'
        | 'progress'
        | 'paused'
        | 'resumed'
        | 'restarted'
        | 'finished';
      value?: number;
    };
  }

  interface SongMatch {
    type: 'song';
    payload: SongMatchDto;
    audio?: HTMLAudioElement;
  }

  interface SongSubmissionMatch {
    type: 'songSubmission';
    payload: SongSubmissionMatchDto;
    audio?: HTMLAudioElement;
  }

  // svelte-ignore non_reactive_update
  const enum SessionFileStatus {
    UPLOADING,
    ANALYZING,
    FINALIZING,
    SUCCEEDED,
    REJECTED,
    FAILED,
  }

  const MATCH_SCORE_THRESHOLD = 1e1;

  let steps = [
    'studio.choose_chart',
    'studio.confirm_song',
    'studio.confirm_chart',
    'studio.upload_song',
    'studio.upload_chart',
    'studio.upload_assets',
  ];

  let { api, songForm, chartForm } = $derived(page.data);

  let step = $state(0);
  let isAndroidOrIos = $state(false);
  let iframe: HTMLIFrameElement | undefined = $state(undefined);
  let zip: File | null = $state(null);
  // svelte-ignore non_reactive_update
  let bundle: ChartBundle;

  let sessionId = $state<string | undefined>();
  let showProgress = $state(true);
  let status = $state<SessionFileStatus>(SessionFileStatus.UPLOADING);
  let name = $derived<string | null>($t(`studio.session.statuses.${status}`));
  let detail = $state<string | null>(null);
  let progress = $state<number | null>(0);
  let bytesRead = $state(0);
  let timer = $state<NodeJS.Timeout | null>(null);

  let songMatches = $state<(SongMatch | SongSubmissionMatch)[]>([]);
  let resourceRecordMatches = $state<ResourceRecordMatchDto[] | null>([]);

  let selectedSongId = $state<string | null>(null);
  let selectedSongSubmissionId = $state<string | null>(null);
  let uploadedSongSubmissionId = $state<string | null>(null);
  let uploadSong = $state<boolean>(false);

  let uplWaveformElement = $state<HTMLDivElement | null>(null);
  let exsWaveformElement = $state<HTMLDivElement | null>(null);
  let wsUpl: WaveSurfer | null = $state(null);
  let wsExs: WaveSurfer | null = $state(null);

  let assetsUploading = $state(false);
  let assetStatuses = $state<number[]>([]);
  let assetErrors = $state<string[]>([]);

  const tracker = new HubConnectionBuilder().withUrl(`${PUBLIC_API_BASE}/hubs/submission`).build();

  const initWaveSurfer = (element: HTMLDivElement, audio: string) =>
    WaveSurfer.create({
      container: element,
      height: 'auto',
      waveColor: '#eee',
      cursorColor: '#bbb',
      progressColor: '#999',
      minPxPerSec: 60,
      cursorWidth: 2,
      hideScrollbar: false,
      autoCenter: false,
      url: audio,
      plugins: [Timeline.create()],
    });

  const clamp = (num: number, lower: number, upper: number) => {
    return Math.min(Math.max(num, lower), upper);
  };

  const humanizeFileSize = (size: number) => {
    var i = size == 0 ? 0 : clamp(Math.floor(Math.log(size) / Math.log(1024)), 0, 4);
    return (size / Math.pow(1024, i)).toFixed(2) + ' ' + ['B', 'KiB', 'MiB', 'GiB', 'TiB'][i];
  };

  const step2 = (useUploadedSong: boolean) => {
    uploadSong = useUploadedSong || (!selectedSongId && !selectedSongSubmissionId);
    if (uploadSong) {
      play();
    } else {
      iframe?.contentWindow?.postMessage(
        {
          type: 'fileUrlInput',
          payload: {
            input: [
              songMatches.find(
                (match) =>
                  (match.type === 'song' && match.payload.id === selectedSongId) ||
                  match.payload.id === selectedSongSubmissionId,
              )!.payload.file,
            ],
          },
        },
        '*',
      );
    }
    step = 2;
  };

  const step5 = () => {
    if (bundle.resources.assets.length === 0) {
    } else {
      step = 5;
      assetStatuses = bundle.resources.assets.map(() => 0);
      assetErrors = bundle.resources.assets.map(() => '');
    }
  };

  const play = () => {
    iframe?.contentWindow?.postMessage(
      {
        type: 'play',
        payload: {
          autoplay: true,
          adjustOffset: true,
          autostart: true,
          newTab: false,
        },
      },
      '*',
    );
  };

  onMount(() => {
    isAndroidOrIos =
      (() => {
        const iosQuirkPresent = function () {
          const audio = new Audio();

          audio.volume = 0.5;
          return audio.volume === 1; // volume cannot be changed from "1" on iOS 12 and below
        };

        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAppleDevice = navigator.userAgent.includes('Macintosh');
        const isTouchScreen = navigator.maxTouchPoints >= 1; // true for iOS 13 (and hopefully beyond)

        return isIOS || (isAppleDevice && (isTouchScreen || iosQuirkPresent()));
      })() ||
      (() => {
        if (/windows phone/i.test(navigator.userAgent)) {
          return false;
        }
        if (/android/i.test(navigator.userAgent)) {
          return true;
        }
        return false;
      })();

    addEventListener(
      'message',
      async (
        e: MessageEvent<
          InputResponseMessage | ChartBundleMessage | FileOutputMessage | EventMessage
        >,
      ) => {
        // if (e.origin !== location.origin) return;
        const message = e.data;
        if (message.type === 'inputResponse') {
          if (message.payload.bundlesResolved < 1) {
            if (step === 0) alert($t('studio.invalid_chart_bundle'));
            else play();
          } else if (
            message.payload.bundlesResolved === 1 ||
            confirm($t('studio.multiple_charts'))
          ) {
            step = 1;
            await tracker.start();
            const sessionResp = await api.submission.createSession();
            if (!sessionResp.ok) {
              alert($t(`error.${(await sessionResp.json()).code}`));
              return;
            }
            sessionId = (await sessionResp.json()).data.id;
            await tracker.invoke('Register', sessionId);
            const songResp = await api.submission.uploadSong({
              id: sessionId,
              Song: bundle.resources.song,
              Illustration: bundle.resources.illustration,
            });
            if (!songResp.ok) {
              alert($t(`error.${(await songResp.json()).code}`));
              return;
            }
            const matchResults = (await songResp.json()).data;
            songMatches = matchResults.songSubmissionMatches
              .filter((match) => match.score >= MATCH_SCORE_THRESHOLD)
              .map((match) => ({
                type: 'songSubmission',
                payload: match,
              }));
            songMatches = songMatches.concat(
              matchResults.songMatches
                .filter((match) => match.score >= MATCH_SCORE_THRESHOLD)
                .map((match) => ({
                  type: 'song',
                  payload: match,
                })),
            );
            songMatches.sort((a, b) => b.payload.score - a.payload.score);
            resourceRecordMatches = matchResults.resourceRecordMatches.filter(
              (match) => match.score >= MATCH_SCORE_THRESHOLD,
            );
            if (resourceRecordMatches.length === 0) {
              resourceRecordMatches = null;
              if (songMatches.length === 0) {
              }
            }
          }
          return;
        }
        if (message.type === 'event' && message.payload.name === 'ready') {
          iframe?.contentWindow?.postMessage({ type: 'zipInput', payload: { input: [zip] } }, '*');
          return;
        }
        if (message.type === 'bundle') {
          console.log('bundle received', message.payload);
          if (!bundle) {
            bundle = message.payload;
            if (bundle.metadata.difficulty === null && bundle.metadata.level !== null) {
              const levelParts = bundle.metadata.level.split(' ');
              if (levelParts.length > 0) {
                let difficulty = levelParts[levelParts.length - 1].match(/\d+(\.\d+)?/g)?.pop();
                bundle.metadata.difficulty = difficulty ? parseFloat(difficulty) : 0;
                bundle.metadata.level = levelParts
                  .slice(0, levelParts.length - 1)
                  .join(' ')
                  .trim();
              }
            }
          }
          return;
        }
        if (message.type === 'fileOutput') {
          const { purpose, file } = message.payload;
          if (purpose === 'adjustedOffset') {
            bundle.resources.chart = file;
            step = uploadSong ? 3 : 4;
          }
          return;
        }
      },
    );

    tracker.on(
      'ReceiveFileProgress',
      (
        _status: SessionFileStatus,
        _detail: string | null,
        _progress: number,
        _bytesRead: number,
      ) => {
        showProgress = true;
        status = _status;
        detail = _detail;
        progress = _progress;
        bytesRead = _bytesRead;

        if (status === SessionFileStatus.SUCCEEDED) {
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => {
            showProgress = false;
          }, 1000);
        }
      },
    );

    $effect(() => {
      if (step === 1 || step === 3) {
        if (uplWaveformElement) {
          wsUpl = initWaveSurfer(uplWaveformElement, URL.createObjectURL(bundle.resources.song));
        }
      }
    });

    $effect(() => {
      if (step === 1) {
        if (exsWaveformElement && (selectedSongId || selectedSongSubmissionId)) {
          untrack(() => {
            if (wsExs) {
              wsExs.destroy();
            }
            wsExs = initWaveSurfer(
              exsWaveformElement!,
              songMatches.find(
                (match) =>
                  (match.type === 'song' && match.payload.id === selectedSongId) ||
                  match.payload.id === selectedSongSubmissionId,
              )!.payload.file,
            );
          });
        }
      }
    });
  });

  const uploadAssets = async () => {
    assetsUploading = true;
    for (let i = 0; i < bundle.resources.assets.length; i++) {
      const asset = bundle.resources.assets[i];
      const resp = await api.submission.createChartAsset(sessionId ?? '', {
        File: asset.file,
        Name: asset.name,
        Type: asset.type,
      });
      if (!resp.ok) {
        assetStatuses[i] = 3;
        assetErrors[i] = $t(`error.${(await resp.json()).code}`);
        continue;
      }
      assetStatuses[i] = 2;
    }
    assetsUploading = false;
    if (assetStatuses.every((status) => status === 2)) {
      step = 6;
    }
  };
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="bg-base-300 min-h-screen">
  <div class="pt-28 pb-4 min-h-screen flex flex-col justify-start">
    <ul class="m-4 steps steps-vertical sm:steps-horizontal">
      {#each steps as s, i}
        <li class="step step-neutral text-lg font-bold {step >= i ? 'step-primary' : ''}">
          {$t(s)}
        </li>
      {/each}
    </ul>
    {#if step === 0}
      <div class="self-center flex-1 my-8 mx-12 flex flex-col gap-4 justify-center items-center">
        {#if !zip}
          <input
            type="file"
            accept={isAndroidOrIos ? null : '.pez,application/zip'}
            class="file-input file-input-bordered border-2 w-full max-w-xs file:btn file:rounded-none dark:file:btn-neutral file:no-animation border-gray-200 rounded-lg transition hover:border-blue-500 hover:ring-blue-500 hover:file:bg-blue-500 hover:file:border-blue-500 focus:border-blue-500 focus:ring-blue-500 focus:file:bg-blue-500 focus:file:border-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:focus:ring-neutral-600"
            oninput={async (e) => {
              const fileList = e.currentTarget.files;
              if (!fileList || fileList.length === 0) return;
              zip = fileList[0];
            }}
          />
          <p class="opacity-70 text-center max-w-sm">{$t('studio.choose_chart_description')}</p>
        {:else}
          <span class="loading loading-dots loading-lg"></span>
        {/if}
      </div>
    {:else if step === 1}
      <div class="my-8 mx-12 flex flex-col items-center">
        <div class="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 flex flex-col gap-12 items-center">
          <div
            class="w-full flex flex-col gap-1 transition opacity-0"
            class:opacity-100={showProgress}
          >
            <div class="flex justify-between items-center">
              <div class="flex gap-3">
                {#if name}
                  <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
                    {name}
                  </h3>
                {/if}
              </div>
              <span class="text-xl text-gray-800 dark:text-white">
                {progress?.toLocaleString(undefined, {
                  style: 'percent',
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
            {#if progress}
              <progress
                class="progress progress-primary w-full"
                value={progress * 100}
                max="100"
              ></progress>
            {:else}
              <progress class="progress progress-primary w-full" max="100"></progress>
            {/if}
            {#if detail}
              <div
                class="flex justify-between opacity-70 text-sm font-semibold text-gray-800 dark:text-white"
              >
                <p>
                  {detail}
                </p>
                <p>
                  {status === SessionFileStatus.ANALYZING ? $t('common.be_patient') : ''}
                </p>
              </div>
            {/if}
          </div>
          {#if resourceRecordMatches !== null}
            <div
              class="w-full flex flex-col gap-4 transition opacity-0"
              class:opacity-100={resourceRecordMatches.length > 0}
            >
              <div class="flex flex-col gap-2">
                <h2 class="text-2xl font-bold">
                  {$t('studio.session.potential_copyright_infringements')}
                </h2>
                <p class="text-base">{$t('studio.session.pci_description')}</p>
              </div>
              <div class="result">
                {#each resourceRecordMatches as match}
                  <div class="min-w-fit">
                    <ResourceRecord resourceRecord={match} target="_blank" />
                  </div>
                {/each}
              </div>
            </div>
          {/if}
          <div
            class="w-full flex flex-col gap-4 transition opacity-0"
            class:opacity-100={songMatches.length > 0}
          >
            <div class="flex flex-col gap-2">
              <h2 class="text-2xl font-bold">{$t('studio.session.potential_song_duplicates')}</h2>
              <p class="text-base">{$t('studio.session.psd_description')}</p>
            </div>
            <div class="result">
              {#each songMatches as match}
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="dropdown dropdown-hover dropdown-bottom"
                  onmouseenter={() => {
                    if (!match.audio) {
                      match.audio = new Audio();
                      match.audio.src = match.payload.file;
                    }
                    match.audio.play();
                  }}
                  onmouseleave={() => {
                    if (match.audio) {
                      match.audio.pause();
                      match.audio.currentTime = 0;
                    }
                  }}
                >
                  {#if match.type === 'song'}
                    <Song song={match.payload} target="_blank" />
                  {:else}
                    <SongSubmission song={match.payload} target="_blank" showDateUpdated={false} />
                  {/if}
                  <button
                    tabindex="-1"
                    class="dropdown-content w-full bg-success border-success bg-opacity-30 border-opacity-30 backdrop-blur z-10 btn btn-outline hover:btn-success border-2 inline-flex gap-2"
                    class:btn-disabled={selectedSongId === match.payload.id ||
                      selectedSongSubmissionId === match.payload.id}
                    onclick={() => {
                      if (match.type === 'song') {
                        selectedSongId = match.payload.id;
                        selectedSongSubmissionId = null;
                      } else {
                        selectedSongId = null;
                        selectedSongSubmissionId = match.payload.id;
                      }
                    }}
                  >
                    {#if selectedSongId === match.payload.id || selectedSongSubmissionId === match.payload.id}
                      {$t('studio.session.selected')}
                    {:else}
                      <i class="fa-solid fa-plus"></i>
                      {$t('studio.session.select')}
                    {/if}
                  </button>
                </div>
              {/each}
            </div>
          </div>
          <div class="my-4 w-full flex flex-col gap-8">
            <div class="h-fit flex flex-grow gap-2 items-center">
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div
                class="w-3/4 h-24"
                bind:this={uplWaveformElement}
                ondblclick={() => {
                  if (wsUpl) {
                    wsUpl.playPause();
                  }
                }}
              ></div>
              <button
                class="w-1/4 h-full p-1 rounded-2xl btn btn-success btn-outline btn-lg text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl border-2 block"
                disabled={status !== SessionFileStatus.SUCCEEDED}
                onclick={() => {
                  step2(true);
                }}
              >
                {$t('studio.session.proceed_with_uploaded_song')}
                <i class="mx-1 fa-solid fa-arrow-right fa-lg"></i>
              </button>
            </div>
            {#if selectedSongId || selectedSongSubmissionId}
              <div class="h-fit flex flex-grow gap-2 items-center">
                <!-- svelte-ignore a11y_no_static_element_interactions -->
                <div
                  class="w-3/4 h-24"
                  bind:this={exsWaveformElement}
                  ondblclick={() => {
                    if (wsExs) {
                      wsExs.playPause();
                    }
                  }}
                ></div>
                <button
                  class="w-1/4 h-full p-1 rounded-2xl btn btn-success btn-outline btn-lg text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl border-2 block"
                  disabled={status !== SessionFileStatus.SUCCEEDED}
                  onclick={() => {
                    step2(false);
                  }}
                >
                  {$t('studio.session.proceed_with', {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    song: (() => {
                      const song = songMatches.find(
                        (match) =>
                          (match.type === 'song' && match.payload.id === selectedSongId) ||
                          match.payload.id === selectedSongSubmissionId,
                      )?.payload;
                      if (!song || !song.edition) return song?.title;
                      return `${song.title} [${song.edition}]`;
                    })(),
                  })}
                  <i class="mx-1 fa-solid fa-arrow-right fa-lg"></i>
                </button>
              </div>
            {/if}
          </div>
        </div>
      </div>
    {:else if step === 2}
      <div class="mt-8 mx-12 flex flex-col items-center">
        <p class="text-base w-fit">
          {$t('studio.session.chart_confirmation_notice')}
        </p>
      </div>
    {:else if step === 3}
      <div class="my-8 mx-12 flex flex-col items-center">
        <div class="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 flex flex-col gap-12 items-center">
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <div
            class="w-full h-24"
            bind:this={uplWaveformElement}
            ondblclick={() => {
              if (wsUpl) {
                wsUpl.playPause();
              }
            }}
          ></div>
          <SongSubmissionForm
            id={sessionId ?? ''}
            form={songForm}
            chartBundle={bundle}
            successCallback={(id: string) => {
              uploadedSongSubmissionId = id;
              step = 4;
            }}
          />
        </div>
      </div>
    {:else if step === 4}
      <div class="my-8 mx-12 flex flex-col items-center">
        <div class="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 flex flex-col gap-12 items-center">
          <ChartSubmissionForm
            id={sessionId ?? ''}
            form={chartForm}
            chartBundle={bundle}
            songId={uploadedSongSubmissionId ? null : selectedSongId}
            songSubmissionId={uploadedSongSubmissionId ?? selectedSongSubmissionId}
            successCallback={() => {
              step5();
            }}
          />
        </div>
      </div>
    {:else if step === 5}
      <div class="my-8 mx-12 flex flex-col items-center">
        <div class="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 flex flex-col gap-6">
          <div class="-m-1.5 p-1.5 inline-block align-middle">
            <table class="table-fixed w-full divide-y divide-gray-200 dark:divide-neutral-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    class="px-3 py-2 w-1/2 sm:w-1/3 md:w-2/5 text-ellipsis overflow-hidden whitespace-nowrap text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                  >
                    {$t('chart.asset.name')}
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-2 w-1/4 md:w-1/5 text-ellipsis overflow-hidden whitespace-nowrap text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                  >
                    {$t('chart.asset.type')}
                  </th>
                  <th
                    scope="col"
                    class="hidden sm:table-cell px-3 py-2 w-1/6 text-ellipsis overflow-hidden whitespace-nowrap text-start text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                  >
                    {$t('common.file_size')}
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-2 text-ellipsis overflow-hidden whitespace-nowrap text-end text-xs font-medium text-gray-500 uppercase dark:text-neutral-500"
                  >
                    {$t(assetsUploading ? 'common.status' : 'common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
                {#each bundle.resources.assets as asset, i}
                  <tr>
                    <td
                      class="px-3 py-3 text-ellipsis overflow-hidden whitespace-nowrap text-sm font-medium text-gray-800 dark:text-neutral-200"
                    >
                      {asset.file.name}
                    </td>
                    <td class="px-2 py-3 md:min-w-fit w-1/6 text-gray-800 dark:text-neutral-200">
                      <div class="relative">
                        <select
                          bind:value={asset.type}
                          class="form-select py-1 px-2 pe-8 block border-gray-200 rounded-lg text-sm focus:z-10 hover:border-blue-500 hover:ring-blue-500 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-base-100 dark:border-neutral-700 dark:text-neutral-300 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                        >
                          {#each Array(6) as _, i}
                            <option value={i} selected={asset.type === i}>
                              {$t(`chart.asset.types.${i}`)}
                            </option>
                          {/each}
                        </select>
                      </div>
                    </td>
                    <td
                      class="px-3 py-3 hidden sm:table-cell md:min-w-fit w-1/12 text-ellipsis overflow-hidden whitespace-nowrap text-sm text-gray-800 dark:text-neutral-200 transition"
                    >
                      {humanizeFileSize(asset.file.size)}
                    </td>
                    <td class="px-3 py-3 min-w-fit text-end text-sm font-medium">
                      {#if assetsUploading}
                        {#if assetStatuses[i] === 0}
                          <i class="fa-solid fa-clock fa-lg"></i>
                        {:else if assetStatuses[i] === 1}
                          <span class="loading loading-spinner loading-lg"></span>
                        {:else if assetStatuses[i] === 2}
                          <i class="fa-solid fa-check fa-lg text-success"></i>
                        {:else if assetStatuses[i] === 3}
                          <div class="tooltip tooltip-open tooltip-left" data-tip={assetErrors[i]}>
                            <i class="fa-solid fa-xmark fa-lg text-error"></i>
                          </div>
                        {/if}
                      {:else}
                        <button
                          type="button"
                          aria-label="Delete"
                          class="inline-flex items-center gap-x-2 text-sm font-semibold rounded-lg transition border border-transparent text-blue-500 hover:text-blue-800 focus:outline-none focus:text-blue-800 disabled:opacity-50 disabled:pointer-events-none dark:text-blue-500 dark:hover:text-blue-400 dark:focus:text-blue-400"
                          onclick={() => {
                            bundle.resources.assets = bundle.resources.assets.filter(
                              (a) => a !== asset,
                            );
                          }}
                        >
                          <i class="fa-regular fa-trash-can fa-lg"></i>
                        </button>
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="w-full flex gap-2">
            <button
              type="button"
              class="btn {assetStatuses.some((status) => status === 3)
                ? 'btn-error'
                : assetsUploading
                  ? 'btn-ghost'
                  : 'btn-outline border-2 normal-border'} inline-flex gap-2"
              disabled={assetsUploading}
              onclick={() => {
                uploadAssets();
              }}
            >
              {#if assetStatuses.some((status) => status === 3)}
                {$t('common.error')}
              {:else if assetsUploading}
                <span class="loading loading-spinner loading-md"></span>
                {$t('common.waiting')}
              {:else}
                <i class="fa-solid fa-upload"></i>
                {$t('studio.upload')}
              {/if}
            </button>
            {#if !assetsUploading && assetStatuses.some((status) => status === 3)}
              <button
                type="button"
                class="btn btn-outline border-2 normal-border inline-flex gap-2"
                onclick={() => {
                  step = 6;
                }}
              >
                {$t('common.continue')}
                <i class="mx-1 fa-solid fa-arrow-right fa-lg"></i>
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
    {#if step <= 2}
      <div
        class="self-center my-8 mx-12 adaptive-width aspect-[3/2] card flex justify-center items-center bg-base-200 transition border-2 normal-border hover:shadow-lg"
        class:hidden={step <= 1}
      >
        {#if zip}
          <iframe
            class="w-full h-full rounded-2xl"
            src="/player"
            title="PhiZone Player"
            bind:this={iframe}
          ></iframe>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .adaptive-width {
    --max-height: calc(100vh - 296px);
    width: max(min(calc(var(--max-height) * 3 / 2), 80%), 320px);
  }
</style>
