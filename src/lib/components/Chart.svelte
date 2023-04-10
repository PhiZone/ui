<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { Chart } from '$lib/models';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getLevelColor, getLevelDisplay } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import Like from './Like.svelte';

  $: ({ api } = $page.data);

  export let chart: Chart;
  export let kind: 'full' | 'inline' = 'full';

  $: song = createQuery(api.song.info({ id: chart.song }));
  $: owner = createQuery(api.user.info({ id: chart.owner ?? 0 }, { enabled: !!chart.owner }));

  $: charter = richtext(chart.charter ?? '', api);
</script>

{#if kind === 'full'}
  <div class="card w-80 bg-base-100 shadow-lg glass overflow-hidden">
    <a href={`/charts/${chart.id}`}>
      <figure class="h-[180px] relative">
        <img
          src={$song.isSuccess ? getCompressedImage($song.data.illustration) : null}
          alt="Illustration"
          class="object-fill"
        />
        <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
          <div class="btn-group btn-group-horizontal">
            <button class={`btn ${getLevelColor(chart.level_type)} btn-sm text-xl no-animation`}>
              {chart.level}
              {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
            </button>
            {#if chart.ranked}
              <button class="btn btn-primary btn-sm text-xl no-animation">
                {$t('chart.ranked')}
              </button>
            {/if}
          </div>
        </div>
      </figure>
      <div class="card-body gap-0.5">
        <h2 class="title w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {$song.isSuccess ? $song.data.name : ''}
        </h2>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('chart.charter')}</span>
          {#if chart.charter}
            {@html $charter}
          {:else}
            {$t('common.anonymous')}
          {/if}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('chart.notes')}</span>
          {chart.notes}
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
            {$owner.data.username}
          </p>
        {/if}
        <div class="card-actions flex items-center justify-end">
          <div
            on:click={(e) => {
              e.preventDefault();
            }}
            on:keyup
          >
            <Like
              id={chart.like}
              likes={chart.like_count}
              type="chart"
              target={chart.id}
              class="btn-sm"
            />
          </div>
        </div>
      </div>
    </a>
  </div>
{:else if kind === 'inline'}
  <a href="/charts/{chart.id}" class="w-full h-[82px] flex items-center px-5">
    <div class="w-1/4 min-w-fit">
      <div class="btn-group btn-group-horizontal">
        <button class="btn {getLevelColor(chart.level_type)} btn-sm text-lg no-animation">
          {chart.level}
          {getLevelDisplay(chart.difficulty)}
        </button>
        {#if chart.ranked}
          <button class="btn btn-primary btn-sm text-lg no-animation">
            {$t('chart.ranked')}
          </button>
        {/if}
      </div>
    </div>
    <div class="w-7/12 text-lg">
      {#if chart.charter}
        {@html $charter}
      {:else}
        {$t('common.anonymous')}
      {/if}
    </div>
    <div class="w-1/6 flex gap-3 items-center justify-between min-w-fit">
      <div
        class="radial-progress text-primary"
        style:--value={(chart.rating / 30) * 100}
        style:--size="48px"
      >
        {chart.rating.toFixed(1)}
      </div>
      <div
        on:click={(e) => {
          e.preventDefault();
        }}
        on:keyup
      >
        <Like
          id={chart.like}
          likes={chart.like_count}
          type="chart"
          target={chart.id}
          class="btn-sm"
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
