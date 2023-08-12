<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Chart from '$lib/components/Chart.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.chart.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.charts')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.charts')}</h1>
  <SearchOptions
    params={searchParams}
    filters={[
      { value: 'id', name: 'id', options: 'number' },
      { value: 'song', name: 'song id', options: 'number' },
      { value: 'owner', name: 'owner id', options: 'number' },
      {
        value: 'level',
        name: 'Level',
        options: [
          { value: 'EZ', name: 'EZ' },
          { value: 'HD', name: 'HD' },
          { value: 'IN', name: 'IN' },
          { value: 'AT', name: 'AT' },
        ],
      },
      { value: 'charter', name: 'charter', options: 'text' },
      { value: 'description', name: 'description', options: 'text' },
      {
        value: 'ranked',
        name: 'ranked',
        options: [
          { value: '1', name: 'yes' },
          { value: '0', name: 'no' },
        ],
      },
      { value: 'difficulty', name: 'difficulty', options: 'range' },
      { value: 'note_count', name: 'note_count', options: 'range' },
      { value: 'score', name: 'score', options: 'range' },
      { value: 'rating', name: 'rating', options: 'range' },
    ]}
    orders={[
      { value: 'id', name: 'id' },
      { value: 'song', name: 'song' },
      { value: 'owner', name: 'owner' },
      { value: 'charter', name: 'charter' },
      { value: 'level', name: 'level' },
      { value: 'difficulty', name: 'difficulty' },
      { value: 'note_count', name: 'note_count' },
      { value: 'score', name: 'score' },
    ]}
  />
  {#if $query.isSuccess}
    {@const { data, total } = $query.data}
    {#if data && data.length > 0}
      <div class="result">
        {#each data as chart}
          <Chart {chart} />
        {/each}
      </div>
      <Pagination {total} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  {/if}
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .result {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 1.5rem;
    justify-items: center;
  }
</style>
