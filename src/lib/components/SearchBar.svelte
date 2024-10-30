<script lang="ts">
  import queryString, { type ParsedQuery } from 'query-string';
  import { t } from '$lib/translations/config';
  import { goto } from '$app/navigation';
  import SearchOptions from './SearchOptions/SearchOptionsModal.svelte';
  import type { SearchFilterType } from '$lib/filters';
  import { convertToParsedQuery, snakeToCamel } from '$lib/utils';

  export let name: string;
  export let pageName = 'page';
  export let searchParams: ParsedQuery<string | number | boolean>;

  let text = '';
  let params = new URLSearchParams();

  $: filterType = snakeToCamel(name.split('.').pop() ?? '') as SearchFilterType;

  const getSearch = (text: string) => {
    if (params.size > 0) searchParams = convertToParsedQuery(params);
    return queryString.stringify({ ...searchParams, [pageName]: 1, search: text });
  };
</script>

<form
  class="form-control"
  on:submit|preventDefault={() => {
    goto(`?${getSearch(text)}`);
  }}
>
  <SearchOptions type={filterType} bind:params />
  <div class="join text-sm lg:text-md">
    <label
      for="search-options-{filterType}"
      class="btn btn-square border-2 normal-border bg-base-100 hover:btn-outline join-item"
    >
      <i class="fa-solid fa-filter fa-lg"></i>
    </label>
    <input
      type="text"
      placeholder={$t('common.search_placeholder', {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resource: $t(name).toLowerCase(),
      })}
      class="input border-2 normal-border transition hover:border-inherit join-item w-full"
      bind:value={text}
    />
    <button class="btn btn-square border-2 normal-border hover:btn-outline bg-base-100 join-item">
      <i class="fa-solid fa-magnifying-glass fa-lg"></i>
    </button>
  </div>
</form>
