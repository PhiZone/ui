<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  import { t } from '$lib/translations/config';
  import { convertTime } from '$lib/utils';

  export let song: string;
  export let illustration: string;
  export let duration: number;
  export let lyrics: { time: number; line: string }[] | null = null;

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

  onDestroy(() => {
    if (playing) {
      pauseAudio();
    }
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

  let timer: NodeJS.Timeout;

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
</script>

<div
  class="rounded-lg transition border-2 normal-border hover:shadow-lg overflow-hidden bg-cover bg-center bg-no-repeat"
  style:background-image="url({illustration})"
>
  <div class="relative">
    <img src={illustration} class="object-fill" alt="Illustration" />
    {#if line}
      <span
        class="absolute left-4 bottom-4 px-2 py-0.5 w-fit bg-black bg-opacity-60 backdrop-blur-lg rounded-full text-lg"
      >
        {line}
      </span>
    {/if}
  </div>
  {#if audio}
    <div class="backdrop-blur-3xl bg-base-100 bg-opacity-50" style:--tw-backdrop-blur="blur(192px)">
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
              class="btn btn-circle btn-sm btn-primary border-2 {loop
                ? 'btn-active'
                : 'btn-outline'} flex items-center justify-center"
              title={$t('song.loop')}
              aria-label={$t('song.loop')}
              on:click={() => {
                loop = !loop;
              }}
            >
              <i class="fa-solid fa-repeat"></i>
            </button>
            <button
              class="btn btn-circle btn-sm btn-primary border-2 btn-outline"
              title={$t('song.rewind')}
              aria-label={$t('song.rewind')}
              on:click={() => {
                let time = audio.currentTime - 10;
                audio.currentTime = Math.max(time, 0);
                time = audio.currentTime;
                syncLyrics();
              }}
            >
              <i class="fa-solid fa-backward"></i>
            </button>
            {#if playing}
              <button
                class="btn btn-circle btn-secondary border-2 btn-outline"
                title={$t('song.pause')}
                aria-label={$t('song.pause')}
                on:click={() => {
                  pauseAudio();
                }}
              >
                <i class="fa-solid fa-pause fa-2xl"></i>
              </button>
            {:else}
              <button
                class="btn btn-circle btn-secondary border-2 btn-outline"
                title={$t('song.play')}
                aria-label={$t('song.play')}
                on:click={() => {
                  playAudio();
                }}
              >
                <i class="fa-solid fa-play fa-xl"></i>
              </button>
            {/if}
            <button
              class="btn btn-circle btn-sm btn-primary border-2 btn-outline"
              title={$t('song.fast_forward')}
              aria-label={$t('song.fast_forward')}
              on:click={() => {
                let time = audio.currentTime + 10;
                audio.currentTime = Math.min(time, duration);
                time = audio.currentTime;
                syncLyrics();
              }}
            >
              <i class="fa-solid fa-forward"></i>
            </button>
            <div class="dropdown dropdown-hover dropdown-top float-right">
              <div
                tabindex="0"
                role="button"
                class="btn btn-circle btn-sm rounded-full btn-primary border-2 btn-outline"
                title={$t('song.volume')}
              >
                <i class="fa-solid fa-volume-high"></i>
              </div>
              <div
                tabindex="-1"
                class="dropdown-content menu p-2 shadow bg-base-100 bg-opacity-50 rounded-box w-[12vw] lg:w-[8vw]"
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
  {/if}
</div>
