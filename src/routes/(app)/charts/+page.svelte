<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Chart from '$lib/components/Chart.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.chart.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.charts')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.charts')}</h1>
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as chart}
          <Chart {chart} />
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
</style>
