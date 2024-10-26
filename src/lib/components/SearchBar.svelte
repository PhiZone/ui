<script lang="ts">
  import queryString, { type ParsedQuery } from 'query-string';
  import { t } from '$lib/translations/config';
  import { goto } from '$app/navigation';
  import SearchOptions from './SearchOptions/SearchOptionsModal.svelte';
  import type { SearchFilterType } from '$lib/filters';
  import { convertToParsedQuery } from '$lib/utils';

  export let name: string;
  export let pageName = 'page';
  export let searchParams: ParsedQuery<string | number | boolean>;

  let text = '';
  let filterType: SearchFilterType = 'charts';
  let params = new URLSearchParams();

  const isAllowedType = (value: string): value is SearchFilterType => {
    console.log(value);
    return [
      'applications',
      'chapters',
      'charts',
      'chartSubmissions',
      'collections',
      'events',
      'records',
      'resourceRecords',
      'serviceScripts',
      'songs',
      'songSubmissions',
      'users',
    ].includes(value);
  };

  if (isAllowedType(name)) {
    filterType = name;
  }

  const getSearch = (text: string) => {
    if (params.size > 0) searchParams = convertToParsedQuery(params);
    return queryString.stringify({ ...searchParams, [pageName]: 1, search: text });
  };
</script>

<SearchOptions type={filterType} bind:params />
<form
  class="form-control"
  on:submit|preventDefault={() => {
    goto(`?${getSearch(text)}`);
  }}
>
  <div class="join text-sm lg:text-md">
    <label
      for="search-options-{name}"
      class="btn btn-square border-2 normal-border bg-base-100 hover:bg-secondary hover:btn-secondary join-item"
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
      class="input border-2 normal-border transition hover:input-secondary join-item w-full"
      bind:value={text}
    />
    <button
      class="btn btn-square border-2 normal-border bg-base-100 hover:bg-secondary hover:btn-secondary join-item"
    >
      <i class="fa-solid fa-magnifying-glass fa-lg"></i>
    </button>
  </div>
</form>
