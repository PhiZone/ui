<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Record from '$lib/components/Record.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.record.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.records')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold">{$t('common.records')}</h1>
  <SearchOptions
    params={searchParams}
    filters={[
      { value: 'id', name: $t('record.id'), options: 'number' },
      { value: 'chartId', name: $t('chart.id'), options: 'number' },
      { value: 'ownerId', name: $t('record.player_id'), options: 'number' },
      {
        value: 'isFullCombo',
        name: $t('record.full_combo'),
        options: [
          { value: '1', name: $t('common.yes') },
          { value: '0', name: $t('common.no') },
        ],
      },
      { value: 'score', name: $t('record.score'), options: 'range' },
      { value: 'acc', name: $t('record.acc'), options: 'range' },
      { value: 'rks', name: $t('record.rks'), options: 'range' },
    ]}
    orders={[
      { value: 'id', name: $t('record.id') },
      { value: 'chart', name: $t('chart.id') },
      { value: 'player', name: $t('record.player_id') },
      { value: 'score', name: $t('record.score') },
      { value: 'accuracy', name: $t('record.acc') },
      { value: 'rks', name: $t('record.rks') },
    ]}
  />
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as record}
          <Record {record} />
        {/each}
      </div>
      <Pagination {total} {perPage} {page} {searchParams} />
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
