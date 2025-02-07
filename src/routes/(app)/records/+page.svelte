<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import queryString from 'query-string';

  import { goto } from '$app/navigation';
  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Record from '$lib/components/Record.svelte';
  import SearchOptions from '$lib/components/SearchOptions/SearchOptionsModal.svelte';
  import { t } from '$lib/translations/config';
  import { convertToParsedQuery } from '$lib/utils';

  let { data } = $props();
  let { searchParams, page, api } = $derived(data);

  let query = $derived(createQuery(api.record.list(searchParams)));

  let text = '';
  let params = $state(new URLSearchParams());

  const getSearch = (text: string) => {
    let query = params.size > 0 ? convertToParsedQuery(params) : searchParams;
    return queryString.stringify({ ...query, page: 1, search: text });
  };
</script>

<svelte:head>
  <title>{$t('common.records')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <div class="flex items-center flex-wrap justify-between gap-2 mb-6">
      <h1 class="text-4xl font-bold">{$t('common.records')}</h1>
      <form
        class="form-control"
        onsubmit={(e) => {
          e.preventDefault();
          goto(`?${getSearch(text)}`);
        }}
      >
        <SearchOptions type="records" bind:params />
        <label
          for="search-options-records"
          class="btn btn-square border-2 normal-border bg-base-100 hover:btn-outline join-item"
        >
          <i class="fa-solid fa-filter fa-lg"></i>
        </label>
      </form>
    </div>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as record}
          <Record {record} />
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
