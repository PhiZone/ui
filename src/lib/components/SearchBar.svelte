<script lang="ts">
  import queryString, { type ParsedQuery } from 'query-string';

  import type { SearchFilterType } from '$lib/filters';

  import { goto } from '$app/navigation';
  import { t } from '$lib/translations/config';
  import { convertToParsedQuery, snakeToCamel } from '$lib/utils';

  import SearchOptions from './SearchOptions/SearchOptionsModal.svelte';

  interface Props {
    name: string;
    pageName?: string;
    searchParams: ParsedQuery<string | number | boolean>;
  }
  let { name, pageName = 'page', searchParams = $bindable() }: Props = $props();

  let text = $state('');
  let params = $state(new URLSearchParams());

  let filterType = $derived(snakeToCamel(name.split('.').pop() ?? '') as SearchFilterType);

  const getSearch = (text: string) => {
    if (params.size > 0) searchParams = convertToParsedQuery(params);
    return queryString.stringify({ ...searchParams, [pageName]: 1, search: text });
  };
</script>

<form
  class="form-control"
  onsubmit={(e) => {
    e.preventDefault();
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
    <button
      class="btn btn-square border-2 normal-border hover:btn-outline bg-base-100 join-item"
      aria-label={$t('common.search')}
    >
      <i class="fa-solid fa-magnifying-glass fa-lg"></i>
    </button>
  </div>
</form>
