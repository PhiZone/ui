<script lang="ts">
  import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
  import JSZip from 'jszip';
  import { onDestroy, onMount, untrack } from 'svelte';
  import WaveSurfer from 'wavesurfer.js';
  import Timeline from 'wavesurfer.js/dist/plugins/timeline.esm.js';

  import type {
    ResourceRecordMatchDto,
    SongMatchDto,
    SongRecognitionSummaryDto,
    SongSubmissionMatchDto,
  } from '$lib/api/submission';
  import type { ChartBundle } from '$lib/types';

  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { PUBLIC_API_BASE, PUBLIC_PLAYER_PATH } from '$env/static/public';
  import { ResponseDtoStatus } from '$lib/api/types';
  import ChartSubmissionForm from '$lib/components/ChartSubmissionForm.svelte';
  import ResourceRecord from '$lib/components/ResourceRecord.svelte';
  import Song from '$lib/components/Song.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import SongSubmissionForm from '$lib/components/SongSubmissionForm.svelte';
  import { SONG_MATCH_SCORE_THRESHOLD } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { createQuery } from '@tanstack/svelte-query';

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
  }

  interface SongSubmissionMatch {
    type: 'songSubmission';
    payload: SongSubmissionMatchDto;
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

  let steps = [
    'studio.choose_chart',
    'studio.confirm_song',
    'studio.confirm_chart',
    'studio.upload_song',
    'studio.upload_chart',
    'studio.upload_assets',
  ];

  let { user, api, songForm, chartForm } = $derived(page.data);

  let step = $state(0);
  let isAndroidOrIos = $state(false);
  let isMilthm = $state(false);
  let isCheckingZip = $state(false);
  let iframe: HTMLIFrameElement | undefined = $state(undefined);
  let zip: File | null = $state(null);
  let bundle: ChartBundle = $state({} as ChartBundle);

  let sessionId = $state<string | undefined>();
  let showProgress = $state(true);
  let status = $state<SessionFileStatus>(SessionFileStatus.UPLOADING);
  let name = $derived<string | null>($t(`studio.session.statuses.${status}`));
  let detail = $state<string | null>(null);
  let progress = $state<number | null>(0);
  // let bytesRead = $state(0);
  let timer = $state<NodeJS.Timeout | null>(null);

  let matchResultsProcessed = $state(false);
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

  let finalizationError = $state<string | null>(null);

  let exactSongMatch = $derived(
    createQuery(
      api.song.list({
        perPage: 1,
        equalsTitle: bundle?.metadata?.title ?? '',
        containsAuthorName: bundle?.metadata?.composer ?? '',
      }),
    ),
  );

  const tryParseMilthmZip = async (file: File): Promise<ChartBundle | null> => {
    try {
      const zip = await JSZip.loadAsync(file);

      // Filter out system files and hidden files (e.g. __MACOSX, .DS_Store)
      const validFiles = Object.values(zip.files).filter(
        (f) => !f.dir && !f.name.includes('__MACOSX') && !f.name.split('/').pop()?.startsWith('.'),
      );

      const metaFile = validFiles.find((f) => f.name.toLowerCase().endsWith('meta.json'));
      let chartFile: JSZip.JSZipObject | undefined;
      let musicFile: JSZip.JSZipObject | undefined;
      let imageFile: JSZip.JSZipObject | undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let meta: any = {};

      const getCaseInsensitive = (obj: any, key: string) => {
        if (!obj) return undefined;
        const foundKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase());
        return foundKey ? obj[foundKey] : undefined;
      };

      if (metaFile) {
        const metaContent = await metaFile.async('string');
        try {
          meta = JSON.parse(metaContent);
        } catch (e) {
          console.warn('Failed to parse meta.json', e);
        }

        const getFile = (path: string) => {
          if (!path) return undefined;
          const normalizedPath = path.replace(/\\/g, '/');
          let entry = zip.file(normalizedPath);
          if (!entry) {
            const fileName = normalizedPath.split('/').pop();
            if (fileName) {
              entry = validFiles.find((f) => f.name.toLowerCase().endsWith(fileName.toLowerCase()));
            }
          }
          return entry;
        };

        const chartPath = getCaseInsensitive(meta, 'chart');
        const musicPath =
          getCaseInsensitive(meta, 'music') || getCaseInsensitive(meta, 'audio');
        const imagePath =
          getCaseInsensitive(meta, 'image') ||
          getCaseInsensitive(meta, 'illustration') ||
          getCaseInsensitive(meta, 'cover');

        if (chartPath) chartFile = getFile(chartPath);
        if (musicPath) musicFile = getFile(musicPath);
        if (imagePath) imageFile = getFile(imagePath);
      }

      if (!chartFile) {
        for (const f of validFiles) {
          if (f.name.toLowerCase().endsWith('.json') && f !== metaFile) {
            const content = await f.async('string');
            try {
              const json = JSON.parse(content);
              if (json.lines) {
                chartFile = f;
                break;
              }
            } catch {
              // ignored
            }
          }
        }
      }

      if (!chartFile) {
        console.warn('Milthm parse failed: No chart file found');
        return null;
      }

      if (!musicFile) {
        musicFile = validFiles.find((f) => /\.(mp3|wav|ogg)$/i.test(f.name));
      }
      if (!imageFile) {
        imageFile = validFiles.find((f) => /\.(jpg|jpeg|png)$/i.test(f.name));
      }

      if (!chartFile || !musicFile || !imageFile) {
        console.warn('Milthm parse failed: Missing files', {
          hasChart: !!chartFile,
          hasMusic: !!musicFile,
          hasImage: !!imageFile,
        });
        return null;
      }

      let chartJson: any = {};
      try {
        const content = await chartFile.async('string');
        chartJson = JSON.parse(content);
      } catch {
        // ignore
      }

      const chartBlob = await chartFile.async('blob');
      const musicBlob = await musicFile.async('blob');
      const imageBlob = await imageFile.async('blob');

      const chartFileObj = new File([chartBlob], chartFile.name);
      const musicFileObj = new File(
        [musicBlob],
        musicFile.name,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { type: 'audio/' + musicFile.name.split('.').pop() },
      );
      const imageFileObj = new File(
        [imageBlob],
        imageFile.name,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { type: 'image/' + imageFile.name.split('.').pop() },
      );

      const chartMeta = chartJson.meta || {};

      const getDifficulty = (val: any) => {
        if (typeof val === 'number') return isNaN(val) ? null : val;
        if (typeof val === 'string') {
          const parsed = parseFloat(val);
          return isNaN(parsed) ? null : parsed;
        }
        return null;
      };

      const diff1 = getDifficulty(getCaseInsensitive(meta, 'difficulty'));
      const diff2 = getDifficulty(getCaseInsensitive(chartMeta, 'difficulty'));

      const metadata = {
        title:
          getCaseInsensitive(meta, 'song_title') ||
          getCaseInsensitive(meta, 'name') ||
          getCaseInsensitive(chartMeta, 'song_title') ||
          getCaseInsensitive(chartMeta, 'name') ||
          getCaseInsensitive(chartJson, 'name') ||
          null,
        composer:
          getCaseInsensitive(meta, 'music_artist') ||
          getCaseInsensitive(meta, 'composer') ||
          getCaseInsensitive(chartMeta, 'music_artist') ||
          getCaseInsensitive(chartMeta, 'composer') ||
          getCaseInsensitive(chartJson, 'composer') ||
          null,
        charter:
          getCaseInsensitive(meta, 'charter') ||
          getCaseInsensitive(chartMeta, 'charter') ||
          getCaseInsensitive(chartJson, 'author') ||
          getCaseInsensitive(chartJson, 'charter') ||
          null,
        illustrator:
          getCaseInsensitive(meta, 'background_artist') ||
          getCaseInsensitive(chartMeta, 'background_artist') ||
          getCaseInsensitive(chartJson, 'illustrator') ||
          null,
        levelType: 0,
        level: getCaseInsensitive(meta, 'level') || getCaseInsensitive(chartMeta, 'level') || null,
        difficulty: diff1 !== null ? diff1 : diff2 !== null ? diff2 : null,
      };

      return {
        resources: {
          song: musicFileObj,
          chart: chartFileObj,
          illustration: imageFileObj,
          assets: [],
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        metadata: metadata,
      };
    } catch (e) {
      console.error('Failed to parse Milthm zip', e);
      return null;
    }
  };

  let tracker: HubConnection | undefined = $state();

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
    if (isMilthm) {
      step = uploadSong ? 3 : 4;
      return;
    }
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
      step6();
    } else {
      step = 5;
      assetStatuses = bundle.resources.assets.map(() => 0);
      assetErrors = bundle.resources.assets.map(() => '');
    }
  };

  const step6 = async () => {
    step = 6;
    const resp = await api.submission.createChart(sessionId ?? '');
    if (resp.ok) {
      const data = await resp.json();
      goto(`/studio/chart-submissions/${data.data.id}`);
    } else {
      const respBackup = resp.clone();
      try {
        const error = await resp.json();
        if (error.status === ResponseDtoStatus.ErrorBrief) {
          finalizationError = $t(`error.${error.code}`);
        } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
          finalizationError = error.message;
        } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
          finalizationError = $t(`error.${error.code}`);
        }
      } catch {
        const error = await respBackup.text();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
      }
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

  const processMatchResults = (matchResults: SongRecognitionSummaryDto) => {
    if (matchResultsProcessed) return;
    songMatches = songMatches.concat(
      matchResults.songSubmissionMatches
        .filter((match) => match.score >= SONG_MATCH_SCORE_THRESHOLD)
        .map((match) => ({
          type: 'songSubmission',
          payload: match,
        })),
    );
    songMatches = songMatches.concat(
      matchResults.songMatches
        .filter(
          (match) =>
            match.score >= SONG_MATCH_SCORE_THRESHOLD &&
            songMatches.every((m) => m.payload.id !== match.id),
        )
        .map((match) => ({
          type: 'song',
          payload: match,
        })),
    );
    songMatches.sort((a, b) => b.payload.score - a.payload.score);
    resourceRecordMatches = matchResults.resourceRecordMatches.filter(
      (match) => match.score >= SONG_MATCH_SCORE_THRESHOLD,
    );
    if (resourceRecordMatches.length === 0) {
      resourceRecordMatches = null;
    }
    matchResultsProcessed = true;
  };

  const startSession = async () => {
    step = 1;
    const sessionResp = await api.submission.createSession();
    const sessionData = await sessionResp.json();
    if (!sessionResp.ok) {
      alert($t(`error.${sessionData.code}`));
      return;
    }
    sessionId = sessionData.data.id;
    if (tracker) await tracker.invoke('Register', sessionId);
    const songResp = await api.submission.uploadSong({
      id: sessionId,
      Song: bundle.resources.song,
      Illustration: bundle.resources.illustration,
    });
    if (!songResp.ok) {
      alert($t(`error.${(await songResp.json()).code}`));
      return;
    }
    processMatchResults((await songResp.json()).data);
    if (isMilthm) {
      step2(true);
    }
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

    tracker = new HubConnectionBuilder().withUrl(`${PUBLIC_API_BASE}/hubs/submission`).build();
    tracker.start();

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
            if (step === 0) {
              if (zip) {
                const milthmBundle = await tryParseMilthmZip(zip);
                if (milthmBundle) {
                  bundle = milthmBundle;
                  isMilthm = true;
                  await startSession();
                  return;
                }
              }
              alert($t('studio.invalid_chart_bundle'));
              zip = null;
            } else play();
          } else if (
            message.payload.bundlesResolved === 1 ||
            confirm($t('studio.multiple_charts'))
          ) {
            await startSession();
          }
          return;
        }
        if (message.type === 'event' && message.payload.name === 'ready') {
          if (!isMilthm && zip) {
            iframe?.contentWindow?.postMessage(
              { type: 'zipInput', payload: { input: [zip] } },
              '*',
            );
          }
          return;
        }
        if (message.type === 'bundle') {
          if (!bundle || Object.keys(bundle).length === 0) {
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
            if (bundle.metadata.charter !== null && user !== undefined) {
              bundle.metadata.charter = bundle.metadata.charter.replaceAll(
                user.userName,
                `[PZUser:${user.id}:${user.userName}:PZRT]`,
              );
            }
            if (bundle.resources.chart) {
              try {
                const text = await bundle.resources.chart.text();
                const json = JSON.parse(text);
                if (json.lines) {
                  isMilthm = true;
                }
              } catch {
                // ignored
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
        // bytesRead = _bytesRead;

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

    tracker.on('ReceiveResult', (dto: SongRecognitionSummaryDto) => processMatchResults(dto));

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

    $effect(() => {
      if (
        bundle?.metadata?.title &&
        bundle?.metadata?.composer &&
        $exactSongMatch.data &&
        $exactSongMatch.data.data.length > 0
      ) {
        untrack(() => {
          songMatches.push({
            type: 'song',
            payload: { score: Infinity, ...$exactSongMatch.data.data[0] },
          });
        });
      }
    });
  });

  onDestroy(() => {
    if (wsUpl) {
      wsUpl.destroy();
    }
    if (wsExs) {
      wsExs.destroy();
    }
    if (timer) {
      clearTimeout(timer);
    }
    if (tracker) tracker.stop();
  });

  const uploadAssets = async (concurrency = 3) => {
    assetsUploading = true;
    const assetQueue = [...Array(bundle.resources.assets.length).keys()];
    const activeUploads = new Set();

    const processNext = async () => {
      if (assetQueue.length === 0) return;

      const index = assetQueue.shift()!;
      activeUploads.add(index);
      assetStatuses[index] = 1;

      const asset = bundle.resources.assets[index];
      try {
        const resp = await api.submission.createChartAsset(sessionId ?? '', {
          File: asset.file,
          Name: asset.name,
          Type: asset.type,
        });

        if (!resp.ok) {
          assetStatuses[index] = 3;
          const json = await resp.json();
          assetErrors[index] = $t(`error.${json.code}`);
        } else {
          assetStatuses[index] = 2;
        }
      } catch (error) {
        assetStatuses[index] = 3;
        assetErrors[index] = $t('common.error');
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
      } finally {
        activeUploads.delete(index);

        // Start next upload if queue isn't empty
        if (assetQueue.length > 0) {
          processNext();
        } else if (activeUploads.size === 0) {
          // All uploads completed
          assetsUploading = false;
          if (assetStatuses.every((status) => status === 2)) {
            step6();
          }
        }
      }
    };

    // Start initial batch of uploads
    const initialBatch = Math.min(concurrency, assetQueue.length);
    for (let i = 0; i < initialBatch; i++) {
      processNext();
    }
  };
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="bg-base-300 min-h-screen">
  <div class="pt-28 pb-4 min-h-screen flex flex-col justify-start">
    {#if step <= 5}
      <ul class="m-4 steps steps-vertical sm:steps-horizontal">
        {#each steps as s, i}
          <li class="step step-neutral text-lg font-bold {step >= i ? 'step-primary' : ''}">
            {$t(s)}
          </li>
        {/each}
      </ul>
    {/if}
    {#if step === 0}
      <div
        class="self-center flex-1 my-8 mx-12 flex flex-col gap-4 justify-center items-center relative"
      >
        {#if !zip}
          <input
            type="file"
            accept={isAndroidOrIos ? null : '.pez,application/zip'}
            class="file-input file-input-bordered border-2 w-full max-w-xs file:btn file:rounded-none dark:file:btn-neutral file:no-animation border-gray-200 rounded-lg transition hover:border-blue-500 hover:ring-blue-500 hover:file:bg-blue-500 hover:file:border-blue-500 focus:border-blue-500 focus:ring-blue-500 focus:file:bg-blue-500 focus:file:border-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:focus:ring-neutral-600"
            oninput={async (e) => {
              const fileList = e.currentTarget.files;
              if (!fileList || fileList.length === 0) return;
              zip = fileList[0];
              isMilthm = false;
              isCheckingZip = true;

              try {
                const milthmBundle = await tryParseMilthmZip(zip);
                if (milthmBundle) {
                  bundle = milthmBundle;
                  isMilthm = true;
                  await startSession();
                }
              } finally {
                isCheckingZip = false;
              }
            }}
          />
          <p class="opacity-70 text-center max-w-sm">{$t('studio.choose_chart_description')}</p>
          <a
            href="/studio/chart-submissions/new"
            class="absolute bottom-5 hover:underline opacity-70 hover:opacity-100 transition"
          >
            {$t('studio.session.upload_chart_only')}
          </a>
        {:else}
          <span class="loading loading-dots w-16"></span>
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
                <div class="dropdown dropdown-hover dropdown-bottom">
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
          <div class="my-4 w-full flex flex-col gap-10">
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
        {#if isMilthm}
          <p class="text-base w-fit mb-4">
            {$t('studio.session.milthm_preview_not_supported')}
          </p>
          <button
            class="btn btn-primary"
            onclick={() => {
              step = uploadSong ? 3 : 4;
            }}
          >
            {$t('common.continue')}
          </button>
        {:else}
          <p class="text-base w-fit">
            {$t('studio.session.chart_confirmation_notice')}
          </p>
        {/if}
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
                    class="px-3 py-2 w-1/2 sm:w-1/3 md:w-2/5 text-ellipsis overflow-hidden whitespace-nowrap text-start font-medium uppercase opacity-70"
                  >
                    {$t('chart.asset.name')}
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-2 w-1/4 md:w-1/5 text-ellipsis overflow-hidden whitespace-nowrap text-start font-medium uppercase opacity-70"
                  >
                    {$t('chart.asset.type')}
                  </th>
                  <th
                    scope="col"
                    class="hidden sm:table-cell px-3 py-2 w-1/6 text-ellipsis overflow-hidden whitespace-nowrap text-start font-medium uppercase opacity-70"
                  >
                    {$t('common.file_size')}
                  </th>
                  <th
                    scope="col"
                    class="px-3 py-2 text-ellipsis overflow-hidden whitespace-nowrap text-end font-medium uppercase opacity-70"
                  >
                    {$t(assetsUploading ? 'common.status' : 'common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 dark:divide-neutral-700">
                {#each bundle.resources.assets as asset, i}
                  <tr>
                    <td
                      class="px-3 py-3 text-ellipsis overflow-hidden whitespace-nowrap text-lg font-medium text-gray-800 dark:text-neutral-200"
                    >
                      {asset.file.name}
                    </td>
                    <td class="px-2 py-3 md:min-w-fit w-1/6 text-gray-800 dark:text-neutral-200">
                      <div class="relative">
                        <select
                          bind:value={asset.type}
                          class="select select-sm text-base transition border-2 normal-border hover:select-secondary"
                          disabled={assetStatuses[i] !== 0}
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
                      class="px-3 py-3 hidden sm:table-cell md:min-w-fit w-1/12 text-ellipsis overflow-hidden whitespace-nowrap text-gray-800 dark:text-neutral-200 transition"
                    >
                      {humanizeFileSize(asset.file.size)}
                    </td>
                    <td class="px-3 py-3 min-w-fit text-end text-lg font-medium">
                      {#if assetsUploading}
                        {#if assetStatuses[i] === 0}
                          <i class="fa-solid fa-clock fa-lg"></i>
                        {:else if assetStatuses[i] === 1}
                          <span class="loading loading-spinner"></span>
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
                          class="btn btn-ghost btn-sm btn-square"
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
              class="grow btn {assetStatuses.some((status) => status === 3)
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
                <span class="loading loading-dots loading-md"></span>
                {$t('common.uploading')}
              {:else}
                <i class="fa-solid fa-upload"></i>
                {$t('studio.upload')}
              {/if}
            </button>
            {#if !assetsUploading && assetStatuses.some((status) => status === 3)}
              <button
                type="button"
                class="grow btn btn-outline border-2 normal-border inline-flex gap-2"
                onclick={() => {
                  step6();
                }}
              >
                {$t('common.continue')}
                <i class="mx-1 fa-solid fa-arrow-right fa-lg"></i>
              </button>
            {/if}
          </div>
        </div>
      </div>
    {:else if step === 6}
      <div class="my-auto flex flex-col items-center gap-4">
        {#if finalizationError}
          <p class="text-4xl font-bold">{$t('common.error')}</p>
          <p class="text-xl">{finalizationError}</p>
        {:else}
          <span class="loading loading-dots w-24"></span>
          <p class="text-4xl font-bold">{$t('studio.session.statuses.2')}</p>
        {/if}
      </div>
    {/if}
    {#if step <= 2}
      <div
        class="self-center my-8 mx-12 adaptive-width aspect-[3/2] card flex justify-center items-center bg-base-200 transition border-2 normal-border hover:shadow-lg"
        class:hidden={step <= 1 || isMilthm}
      >
        {#if zip && !isCheckingZip && !isMilthm}
          <iframe
            class="w-full h-full rounded-2xl"
            src={PUBLIC_PLAYER_PATH}
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
