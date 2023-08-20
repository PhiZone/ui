<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { ChartDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getLevelColor, getLevelDisplay } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import Like from './Like.svelte';

  $: ({ api } = $page.data);

  export let chart: ChartDto;
  export let kind: 'full' | 'inline' = 'full';
  export let showSong: boolean = true;
  export let showCharter: boolean = true;

  $: song = createQuery(api.song.info({ id: chart.songId }));
  $: owner = createQuery(api.user.info({ id: chart.ownerId }));

  $: charter = richtext(chart.authorName ?? '', api);
</script>

{#if kind === 'full'}
  <div
    class="card w-80 bg-base-100 shadow-lg hover:shadow-sm hover:shadow-primary-focus overflow-hidden"
  >
    <a href={`/charts/${chart.id}`}>
      <figure class="h-[180px] relative">
        <img
          src={chart.illustration ?? ($song.isSuccess ? $song.data.data.illustration : null)}
          alt="Illustration"
          class="object-fill"
        />
        <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
          <div class="join join-horizontal">
            <button
              class={`btn ${getLevelColor(chart.levelType)} btn-sm join-item text-xl no-animation`}
            >
              {chart.level}
              {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
            </button>
            {#if chart.isRanked}
              <button class="btn btn-primary btn-sm join-item text-xl no-animation">
                {$t('chart.ranked')}
              </button>
            {/if}
          </div>
        </div>
      </figure>
      <div class="card-body gap-0.5">
        <h2 class="title w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {$song.isSuccess ? $song.data.data.title : ''}
        </h2>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('chart.charter')}</span>
          {#if chart.authorName}
            {@html $charter}
          {:else}
            {$t('common.anonymous')}
          {/if}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('chart.notes')}</span>
          {chart.noteCount}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('chart.score')}</span>
          {chart.score.toFixed(2)}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('chart.rating')}</span>
          {chart.rating.toFixed(2)}
        </p>
        {#if $owner.isSuccess}
          <p class="whitespace-nowrap overflow-hidden text-ellipsis">
            <span class="badge badge-primary badge-outline mr-1">{$t('chart.owner')}</span>
            {$owner.data.data.userName}
          </p>
        {/if}
        <div class="card-actions flex items-center justify-end">
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
              class="btn-sm"
            />
          </div>
        </div>
      </div>
    </a>
  </div>
{:else if kind === 'inline'}
  <a href="/charts/{chart.id}" class="w-full flex items-center gap-3 overflow-hidden px-5 h-16">
    <div class="flex {showCharter ? 'lg:w-1/2 w-5/6' : 'w-5/6'} gap-2">
      {#if showSong}
        <div class="hidden md:flex md:w-1/2 2xl:w-2/3 text-xl font-bold">
          {$song.data?.data.title}
        </div>
      {/if}
      <div class="join join-horizontal items-center">
        <button class="btn {getLevelColor(chart.levelType)} btn-sm join-item text-lg no-animation">
          {chart.level}
          {getLevelDisplay(chart.difficulty)}
        </button>
        {#if chart.isRanked}
          <button class="btn btn-primary btn-sm join-item text-lg no-animation">
            {$t('chart.ranked')}
          </button>
        {/if}
      </div>
    </div>
    {#if showCharter}
      <div class="hidden lg:inline w-1/3 max-w-1/3 text-lg">
        {#if chart.authorName}
          {@html $charter}
        {:else}
          {$t('common.anonymous')}
        {/if}
      </div>
    {/if}
    <div class="w-1/6 flex gap-3 items-center justify-between min-w-fit">
      <div
        class="radial-progress text-primary hidden xl:grid"
        style:--value={(chart.rating / 5) * 100}
        style:--size="48px"
      >
        {chart.rating.toFixed(1)}
      </div>
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
    </div>
  </a>
{/if}

<style>
  .title {
    gap: 0.5rem /* 8px */;
    font-size: 1.25rem /* 20px */;
    line-height: 1.75rem /* 28px */;
    font-weight: 600;
    margin-bottom: 4px;
  }
</style>
