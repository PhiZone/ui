<script lang="ts">
  import queryString from 'query-string';
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { goto } from '$app/navigation';
  import Record from '$lib/components/Record.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';
  import SearchOptions from '$lib/components/SearchOptions/SearchOptionsModal.svelte';
  import { convertToParsedQuery } from '$lib/utils';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.record.list(searchParams));

  let text = '';
  let params = new URLSearchParams();

  const getSearch = (text: string) => {
    if (params.size > 0) searchParams = convertToParsedQuery(params);
    return queryString.stringify({ ...searchParams, page: 1, search: text });
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
        on:submit|preventDefault={() => {
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
  <div class="min-h-page skeleton" />
{/if}
