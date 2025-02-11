<script lang="ts">
  import { onMount } from 'svelte';

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

  let steps = [
    'studio.choose_chart',
    'studio.confirm_chart',
    'studio.upload_song',
    'studio.upload_chart',
  ];

  let step = 0;
  let isAndroidOrIos = false;
  let iframe: HTMLIFrameElement;
  let zip: File | null = null;
  let bundle: ChartBundle;

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
      (e: MessageEvent<InputResponseMessage | ChartBundleMessage | FileOutputMessage>) => {
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
            iframe.contentWindow?.postMessage(
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
          }
          return;
        }
        if (message.type === 'bundle') {
          bundle = message.payload;
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
  });
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="bg-base-300 min-h-screen">
  <div class="pt-28 pb-4 flex flex-col justify-center">
    <ul class="m-4 steps steps-vertical sm:steps-horizontal">
      {#each steps as s, i}
        <li class="step step-neutral {step >= i ? 'step-primary' : ''}">
          {$t(s)}
        </li>
      {/each}
    </ul>
    {#if step < 2}
      <div
        class="self-center my-8 mx-12 adaptive-width aspect-[3/2] card flex justify-center items-center bg-base-100 transition border-2 normal-border hover:shadow-lg"
      >
        {#if !zip}
          <input
            type="file"
            accept={isAndroidOrIos ? null : '.pez,application/zip'}
            class="file-input file-input-bordered border-2 w-full max-w-xs file:btn dark:file:btn-neutral file:no-animation border-gray-200 rounded-lg transition hover:border-blue-500 hover:ring-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700 dark:text-neutral-300 dark:focus:ring-neutral-600"
            on:input={async (e) => {
              const fileList = e.currentTarget.files;
              if (!fileList || fileList.length === 0) return;
              zip = fileList[0];
            }}
          />
        {:else}
          <iframe
            class="w-full h-full rounded-2xl"
            src="https://insider.phizone.cn/player"
            title="PhiZone Player"
            bind:this={iframe}
            on:load={() => {
              if (!iframe || !zip) {
                console.warn('iframe or zip not ready');
              }
              iframe?.contentWindow?.postMessage({ type: 'zipInput', payload: [zip] }, '*');
            }}
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
