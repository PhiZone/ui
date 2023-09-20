<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { t } from '$lib/translations/config';
  import { convertTime } from '$lib/utils';

  export let song: string;
  export let illustration: string;
  export let duration: number;
  export let lyrics: Array<{ time: number; line: string }> | null = null;

  let playing = false;
  let time = 0;
  let loop = false;

  let audio: HTMLAudioElement;
  let line = '';
  let lyricsIndex = -1;

  onMount(() => {
    audio = new Audio(song);
    audio.volume = 0.4;
  });

  const syncLyrics = () => {
    if (!lyrics || time < lyrics[0].time) {
      return;
    }
    let l = 0,
      r = lyrics.length - 1,
      m = (l + r) >> 1;
    while (l < r) {
      if (lyrics[m].time <= time && lyrics[m + 1].time > time) {
        break;
      } else if (lyrics[m].time > time) {
        r = m - 1;
      } else if (lyrics[m + 1].time <= time) {
        l = m + 1;
      }
      m = (l + r) >> 1;
    }
    lyricsIndex = m;
    line = lyrics[lyricsIndex].line;
  };

  let timer: NodeJS.Timer;

  const playAudio = () => {
    audio.currentTime = time;
    syncLyrics();
    audio.play();
    playing = true;
    timer = setInterval(() => {
      time = audio ? audio.currentTime : 0;
      if (lyrics && lyricsIndex < lyrics.length - 1 && lyrics[lyricsIndex + 1].time < time) {
        line = lyrics[++lyricsIndex].line;
      }
      if (audio.ended) {
        if (loop) {
          audio.currentTime = time = 0;
          syncLyrics();
          audio.play();
          playing = true;
        } else {
          playing = false;
          clearInterval(timer);
        }
      }
    }, 10);
  };

  const pauseAudio = () => {
    audio.pause();
    playing = false;
    clearInterval(timer);
  };

  onDestroy(() => {
    if (playing) {
      pauseAudio();
    }
  });
</script>

<div class="rounded-lg shadow-lg overflow-hidden">
  <div class="relative">
    <img src={illustration} class="object-fill" alt="Illustration" />
    {#if line}
      <div
        class="absolute p-4 inset-0 flex form-control justify-end backdrop backdrop-blur-5 text-neutral-content"
      >
        <span class="text-neutral-content px-2 py-0.5 w-fit bg-black bg-opacity-60 rounded-full">
          {line}
        </span>
      </div>
    {/if}
  </div>
  {#if audio}
    <div class="bg-cover bg-center bg-no-repeat" style:background-image="url({illustration})">
      <div
        class="backdrop-blur-3xl bg-base-100 bg-opacity-50"
        style:--tw-backdrop-blur="blur(192px)"
      >
        <div class="px-3 pt-2">
          <input
            type="range"
            min="0"
            max={duration}
            bind:value={time}
            step={0.001}
            class="range range-primary range-xs"
            on:mousedown={() => {
              pauseAudio();
            }}
            on:mouseup={() => {
              playAudio();
            }}
          />
        </div>
        <div class="flex flex-col justify-between text-xs font-semibold px-4 py-1">
          <div class="flex">
            <p class="w-1/2 text-left opacity-75 min-w-fit">
              {convertTime(Math.min(time, duration))}
            </p>
            <p class="w-1/2 text-right opacity-75 min-w-fit">
              {convertTime(duration)}
            </p>
          </div>
          <div class="flex justify-center">
            <div class="flex items-center space-x-3 pb-2">
              <button
                class="btn btn-circle btn-sm btn-primary {loop
                  ? 'btn-active'
                  : 'btn-outline'} flex items-center justify-center"
                title={$t('song.loop')}
                on:click={() => {
                  loop = !loop;
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  version="1.1"
                  class="w-[19px] h-[19px]"
                  fill="currentColor"
                  x="0px"
                  y="0px"
                  viewBox="0 0 512 512"
                  enable-background="new 0 0 512 512"
                  xml:space="preserve"
                >
                  <path
                    d="M447.1,86.2C400.3,33.4,332.2,0,256,0C114.6,0,0,114.6,0,256h64c0-106.1,85.9-192,192-192c58.5,0,110.4,26.5,145.5,67.8  L341.3,192H512V21.3L447.1,86.2z M256,448c-58.5,0-110.4-26.5-145.5-67.8l60.2-60.2H0v170.7l64.9-64.9  c46.8,52.8,115,86.2,191.1,86.2c141.4,0,256-114.6,256-256h-64C448,362.1,362.1,448,256,448z M298.7,256c0-23.6-19.1-42.7-42.7-42.7  s-42.7,19.1-42.7,42.7s19.1,42.7,42.7,42.7S298.7,279.6,298.7,256z"
                  />
                </svg>
              </button>
              <button
                class="btn btn-circle btn-sm btn-primary btn-outline flex items-center justify-center"
                title={$t('song.rewind')}
                on:click={() => {
                  let time = audio.currentTime - 10;
                  audio.currentTime = Math.max(time, 0);
                  time = audio.currentTime;
                  syncLyrics();
                }}
              >
                <svg class="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="20 20 10 12 20 4 20 20" />
                  <polygon points="10 20 0 12 10 4 10 20" />
                </svg>
              </button>
              {#if playing}
                <button
                  class="btn btn-circle btn-secondary btn-outline flex items-center justify-center px-0.5"
                  title={$t('song.pause')}
                  on:click={() => {
                    pauseAudio();
                  }}
                >
                  <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 10 3 10 21 5 21 5 3" />
                    <polygon points="14 3 19 3 19 21 14 21 14 3" />
                  </svg>
                </button>
              {:else}
                <button
                  class="btn btn-circle btn-secondary btn-outline flex items-center justify-center px-0.5"
                  title={$t('song.play')}
                  on:click={() => {
                    playAudio();
                  }}
                >
                  <svg class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </button>
              {/if}
              <button
                class="btn btn-circle btn-sm btn-primary btn-outline flex items-center justify-center"
                title={$t('song.fast_forward')}
                on:click={() => {
                  let time = audio.currentTime + 10;
                  audio.currentTime = Math.min(time, duration);
                  time = audio.currentTime;
                  syncLyrics();
                }}
              >
                <svg class="w-[21px] h-[21px]" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="4 4 14 12 4 20 4 4" />
                  <polygon points="14 4 24 12 14 20 14 4" />
                </svg>
              </button>
              <div class="dropdown dropdown-hover dropdown-top float-right">
                <button
                  tabindex="0"
                  class="btn btn-circle btn-sm rounded-full btn-primary btn-outline flex items-center justify-center"
                  title={$t('song.volume')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-[19px] h-[19px]"
                    viewBox="0 0 22 18"
                  >
                    <g
                      fill="none"
                      fill-rule="evenodd"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      transform="translate(1 1)"
                    >
                      <path
                        d="M9 1L4 5H0v6h4l5 4zM17.07.93c3.904 3.905 3.904 10.235 0 14.14M13.54 4.46a5 5 0 010 7.07"
                      />
                    </g>
                  </svg>
                </button>
                <div
                  tabindex="-1"
                  class="dropdown-content menu p-2 shadow bg-base-100 bg-opacity-50 rounded-box w-[12vw]"
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    bind:value={audio.volume}
                    step="0.001"
                    class="range range-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
