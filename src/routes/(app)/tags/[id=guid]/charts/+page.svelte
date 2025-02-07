<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Chart from '$lib/components/Chart.svelte';
  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { searchParams, page, id, api } = $derived(data);

  let tag = $derived(createQuery(api.tag.info({ id })));
  let query = $derived(createQuery(api.chart.listTag({ id, ...searchParams })));
</script>

<svelte:head>
  <title>
    {$t('common.charts')} | {$t('common.tag')} - #{$tag.data?.data.normalizedName} | {$t(
      'common.site_name',
    )}
  </title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <h3 class="text-lg opacity-70">#{$tag.data?.data.normalizedName}</h3>
    <h1 class="text-4xl font-bold mb-6">{$t('common.charts')}</h1>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as chart}
          <Chart {chart} />
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
