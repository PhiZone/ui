<script lang="ts">
  import { HubConnectionBuilder } from '@microsoft/signalr';
  import { onMount } from 'svelte';

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

  const MATCH_SCORE_THRESHOLD = 1e4;

  let steps = [
    'studio.choose_chart',
    'studio.confirm_song',
    'studio.confirm_chart',
    'studio.upload_song',
    'studio.upload_chart',
  ];

  let { api, songForm } = $derived(page.data);

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
  let uploadSong = $state<boolean>(false);

  let uplWaveformElement = $state<HTMLDivElement | null>(null);
  let exsWaveformElement = $state<HTMLDivElement | null>(null);
  let wsUpl: WaveSurfer | null = $state(null);
  let wsExs: WaveSurfer | null = $state(null);

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
          if (!bundle) bundle = message.payload;
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
      if (step === 1) {
        if (uplWaveformElement)
          wsUpl = initWaveSurfer(uplWaveformElement, URL.createObjectURL(bundle.resources.song));
        if (exsWaveformElement && (selectedSongId || selectedSongSubmissionId))
          wsExs = initWaveSurfer(
            exsWaveformElement,
            songMatches.find(
              (match) =>
                (match.type === 'song' && match.payload.id === selectedSongId) ||
                match.payload.id === selectedSongSubmissionId,
            )!.payload.file,
          );
      }
    });
  });
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
      <p class="text-base w-fit mx-auto mt-8">
        {$t('studio.session.chart_confirmation_notice')}
      </p>
    {:else if step === 3}
      <div class="my-8 mx-12">
        <SongSubmissionForm
          form={songForm}
          audioSrc={URL.createObjectURL(bundle.resources.song)}
          successCallback={() => {
            step = 4;
          }}
        />
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
