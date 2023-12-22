<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { ChartDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getLevelColor, getLevelDisplay } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import Like from './Like.svelte';
  import Rating from './Rating.svelte';

  $: ({ api } = $page.data);

  export let chart: ChartDto;
  export let kind: 'full' | 'inline' = 'full';
  export let showSong = true;
  export let showCharter = true;
  export let showLike = true;

  $: song = createQuery(api.song.info({ id: chart.songId }));
  $: charter = richtext(chart.authorName ?? '');
</script>

{#if kind === 'full'}
  <div
    class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
  >
    <a href={`/charts/${chart.id}`}>
      <figure class="h-[167px] relative">
        {#if chart.illustration || $song.isSuccess}
          <img
            src={getCompressedImage(chart.illustration ?? $song.data?.data.illustration)}
            alt="Illustration"
            class="object-fill"
          />
        {:else}
          <div class="skeleton rounded-none w-full h-full"></div>
        {/if}
        <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
          <div class="join join-horizontal">
            <button
              class={`btn ${getLevelColor(chart.levelType)} btn-sm join-item text-xl no-animation`}
            >
              {chart.level}
              {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
            </button>
            {#if chart.isRanked}
              <button
                class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg btn-sm join-item text-xl no-animation"
              >
                {$t('chart.ranked')}
              </button>
            {/if}
          </div>
        </div>
      </figure>
      <div class="card-body py-6 gap-0.5">
        <div class="w-full">
          {#if chart.title || $song.isSuccess}
            <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
              {chart.title ?? $song.data?.data.title}
            </h2>
          {:else}
            <div class="skeleton h-7"></div>
          {/if}
          <Rating rating={chart.rating} />
        </div>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.charter')}</span>
          {#if chart.authorName}
            {@html $charter}
          {:else}
            {$t('common.anonymous')}
          {/if}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.notes')}</span>
          {chart.noteCount}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.score')}</span>
          {chart.score.toFixed(2)}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.rating')}</span>
          {chart.rating.toFixed(2)}
        </p>
        {#if showLike}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="absolute bottom-8 right-8"
            on:click={(e) => {
              e.preventDefault();
            }}
            on:keyup
          >
            <Like
              id={chart.id}
              likes={chart.likeCount}
              type="charts"
              liked={chart.dateLiked != null}
              class="btn-sm"
            />
          </div>
        {/if}
      </div>
    </a>
  </div>
{:else if kind === 'inline'}
  <a href="/charts/{chart.id}" class="w-full flex items-center gap-3 overflow-hidden px-5 h-16">
    <div class="flex {showCharter ? 'lg:w-1/2 w-5/6' : 'w-5/6'} gap-2">
      {#if showSong}
        {#if chart.title || $song.isSuccess}
          <div class="sm:w-1/2 2xl:w-2/3 text-xl font-bold ellipsis-2-md">
            {$song.data?.data.title}
          </div>
        {:else}
          <div class="skeleton sm:w-1/2 2xl:w-2/3 h-7 ellipsis-2-md"></div>
        {/if}
      {/if}
      <div class="{showSong ? 'hidden sm:flex' : ''} join join-horizontal items-center">
        <button class="btn {getLevelColor(chart.levelType)} btn-sm join-item text-lg no-animation">
          {chart.level}
          {getLevelDisplay(chart.difficulty)}
        </button>
        {#if chart.isRanked}
          <button
            class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg btn-sm join-item text-lg no-animation"
          >
            {$t('chart.ranked')}
          </button>
        {/if}
      </div>
    </div>
    {#if showCharter}
      <div class="hidden lg:inline w-1/3 max-w-1/3 lg:text-lg ellipsis-2-lg">
        {#if chart.authorName}
          {@html $charter}
        {:else}
          {$t('common.anonymous')}
        {/if}
      </div>
    {/if}
    <div class="w-1/6 flex gap-3 items-center justify-between min-w-fit">
      <div class="hidden sm:inline">
        <Rating rating={chart.rating} direction="left" />
      </div>
      {#if showLike}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={(e) => {
            e.preventDefault();
          }}
          on:keyup
        >
          <Like
            id={chart.id}
            likes={chart.likeCount}
            type="charts"
            liked={chart.dateLiked != null}
            class="btn-sm w-24"
          />
        </div>
      {/if}
    </div>
  </a>
{/if}

<style>
  .ellipsis-2-md {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 640px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .ellipsis-2-lg {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 1024px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
