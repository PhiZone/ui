<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import ChartSubmission from '$lib/components/ChartSubmission.svelte';
  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { searchParams, page, api } = $derived(data);

  let query = $derived(createQuery(api.chart.submission.list(searchParams)));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.chart_submission')} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="bg-base-300 min-h-screen">
    <div class="pt-32 pb-4 flex justify-center">
      <div class="w-3/4 max-w-7xl min-w-20">
        <div class="flex flex-wrap gap-2 justify-between items-center mb-6">
          <h1 class="text-4xl font-bold content">
            {$t('studio.chart_submissions')}
          </h1>
          <SearchBar name="studio.chart_submissions" {searchParams} />
          <a
            href="/studio/chart-submissions/new"
            class="btn text-lg btn-xl border-2 btn-outline normal-border"
          >
            {$t('studio.upload_chart')}
          </a>
        </div>
        {#if total && perPage && data && data.length > 0}
          <div class="result">
            {#each data as chart}
              <ChartSubmission {chart} />
            {/each}
          </div>
          <Paginator {total} {perPage} {page} {searchParams} />
        {:else}
          <p class="py-3 text-center">{$t('common.empty')}</p>
        {/if}
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
