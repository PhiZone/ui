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

  interface Resources {
    song: File;
    chart: File;
    illustration: File;
    assets: {
      name: string;
      type: number;
      file: File;
    }[];
  }

  interface Metadata {
    title: string | null;
    composer: string | null;
    charter: string | null;
    illustrator: string | null;
    levelType: 0 | 1 | 2 | 3 | 4;
    level: string | null;
    difficulty: number | null;
  }

  interface ChartBundle {
    resources: Resources;
    metadata: Metadata;
  }

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

  enum SessionFileStatus {
    UPLOADING,
    ANALYZING,
    FINALIZING,
    SUCCEEDED,
    REJECTED,
    FAILED,
  }

  let steps = [
    'studio.choose_chart',
    'studio.upload_song',
    'studio.confirm_chart',
    'studio.upload_chart',
  ];

  let { api } = $derived(page.data);

  let step = $state(0);
  let isAndroidOrIos = $state(false);
  let iframe: HTMLIFrameElement | undefined = $state(undefined);
  let zip: File | null = $state(null);
  let bundle: ChartBundle;

  let sessionId: string | undefined = $state();
  let status: SessionFileStatus | undefined = $state();
  let name = $state<string | null>(null);
  let detail = $state<string | null>(null);
  let progress = $state(0);
  let bytesRead = $state(0);

  let songMatches: (SongMatchDto | SongSubmissionMatchDto)[] = $state([]);
  let resourceRecordMatches: ResourceRecordMatchDto[] = $state([]);

  const tracker = new HubConnectionBuilder().withUrl(`${PUBLIC_API_BASE}/hubs/submission`).build();

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
            alert($t('studio.invalid_chart_bundle'));
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
            songMatches = matchResults.songSubmissionMatches;
            songMatches = songMatches.concat(matchResults.songMatches);
            songMatches.sort((a, b) => b.score - a.score);
            resourceRecordMatches = matchResults.resourceRecordMatches;
            // iframe?.contentWindow?.postMessage(
            //   {
            //     type: 'play',
            //     payload: {
            //       autoplay: true,
            //       adjustOffset: true,
            //       autostart: true,
            //       newTab: false,
            //     },
            //   },
            //   '*',
            // );
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
            step = 2;
          }
          return;
        }
      },
    );

    tracker.on(
      'ReceiveFileProgress',
      (
        _status: SessionFileStatus,
        _name: string | null,
        _detail: string | null,
        _progress: number,
        _bytesRead: number,
      ) => {
        status = _status;
        name = _name;
        detail = _detail;
        progress = _progress;
        bytesRead = _bytesRead;
      },
    );
  });
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="bg-base-300 min-h-screen">
  <div class="pt-28 pb-4 min-h-screen flex flex-col justify-start">
    <ul class="m-4 steps steps-vertical sm:steps-horizontal">
      {#each steps as s, i}
        <li class="step step-neutral {step >= i ? 'step-primary' : ''}">
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
      <div class="flex my-8 mx-12 flex-col gap-4 items-center">
        <div class="w-full sm:w-5/6 md:w-3/4 lg:w-2/3">
          <div class="mb-2 flex justify-between items-center">
            <div class="flex gap-3">
              {#if name}
                <h3 class="text-xl font-semibold text-gray-800 dark:text-white">
                  {name}
                </h3>
              {/if}
            </div>
            <span class="text-xl text-gray-800 dark:text-white">
              {progress.toLocaleString(undefined, {
                style: 'percent',
                minimumFractionDigits: 0,
              })}
            </span>
          </div>
          <div
            class="flex w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700"
            role="progressbar"
            aria-valuenow={progress * 100}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div
              class="flex flex-col justify-center rounded-full overflow-hidden bg-blue-500 text-xs text-white text-center whitespace-nowrap transition duration-500 dark:bg-blue-500"
              style="width: {progress * 100}%"
            ></div>
          </div>
          {#if detail}
            <h3 class="text-sm font-semibold text-gray-800 dark:text-white">
              {detail}
            </h3>
          {/if}
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
            src="http://localhost:9900/"
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
