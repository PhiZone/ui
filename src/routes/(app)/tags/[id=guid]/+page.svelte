<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import Error from '$lib/components/Error.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { PAGINATION_PER_PAGE } from '$lib/constants';

  export let data;
  $: ({ id, api } = data);

  $: tag = createQuery(api.tag.info({ id }));
  $: songs = createQuery(api.song.listTag({ id }));
  $: charts = createQuery(api.chart.listTag({ id }));
</script>

<svelte:head>
  <title>{$t('common.tag')} - #{$tag.data?.data.normalizedName} | {$t('common.title')}</title>
</svelte:head>

{#if $tag.isSuccess}
  <div class="page">
    <div class="flex flex-col mb-10">
      <h3 class="text-lg opacity-70">#{$tag.data.data.normalizedName}</h3>
      <h1 class="text-5xl font-bold">{$tag.data.data.name}</h1>
      {#if $tag.data.data.description}
        <p class="py-3">{$tag.data.data.description}</p>
      {/if}
    </div>
    {#if $songs.isSuccess}
      {@const { total, perPage, data } = $songs.data}
      {#if total && perPage && data.length > 0}
        <div class="flex items-center mt-6 mb-2 justify-between">
          <h2 class="text-3xl font-bold">
            {$t('common.songs')}
          </h2>
          {#if total && total > PAGINATION_PER_PAGE}
            <a
              class="min-w-fit btn btn-sm border-2 normal-border btn-outline"
              href="/tags/{id}/songs"
            >
              {$t('common.all')}
              <i class="fa-solid fa-angles-right"></i>
            </a>
          {/if}
        </div>
        <div class="result">
          {#each data as song}
            <div class="min-w-fit">
              <Song {song} />
            </div>
          {/each}
        </div>
      {:else}
        <h2 class="text-3xl font-bold mt-6 mb-2">
          {$t('common.songs')}
        </h2>
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {:else}
      <div class="min-h-page skeleton" />
    {/if}
    {#if $charts.isSuccess}
      {@const { total, perPage, data } = $charts.data}
      {#if total && perPage && data.length > 0}
        <div class="flex items-center mt-6 mb-2 justify-between">
          <h2 class="text-3xl font-bold">
            {$t('common.charts')}
          </h2>
          {#if total && total > PAGINATION_PER_PAGE}
            <a
              class="min-w-fit btn btn-sm border-2 normal-border btn-outline"
              href="/tags/{id}/charts"
            >
              {$t('common.all')}
              <i class="fa-solid fa-angles-right"></i>
            </a>
          {/if}
        </div>
        <div class="result">
          {#each data as chart}
            <div class="min-w-fit">
              <Chart {chart} />
            </div>
          {/each}
        </div>
      {:else}
        <h2 class="text-3xl font-bold mt-6 mb-2">
          {$t('common.charts')}
        </h2>
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {:else}
      <div class="min-h-page skeleton" />
    {/if}
  </div>
{:else if $tag.isError}
  <Error error={$tag.error} />
{:else}
  <div class="min-h-page skeleton" />
{/if}
