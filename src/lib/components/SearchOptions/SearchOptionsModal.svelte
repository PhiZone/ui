<script lang="ts">
  import { t } from '$lib/translations/config';
  import Item from './Item.svelte';

  import { generateParams, getFilterValue, getFullFilters, storeFilterValue } from '$lib/filters';
  import type { SearchFilterType } from '$lib/filters';

  export let type: SearchFilterType;
  export let params: URLSearchParams = new URLSearchParams();

  $: filters = getFullFilters(type, true);
  $: data = getFilterValue(filters);

  $: {
    params = generateParams(data);
    storeFilterValue(type, data);
  }

  let open = false;
</script>

<input type="checkbox" id="search-options-{type}" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box text-left w-1/2 max-w-4xl min-w-fit min-h-fit">
    <label
      for="search-options-{type}"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <div class="font-bold text-lg">
      {$t('common.search_options')}
    </div>
    <div class="form-control items-stretch w-full my-4 max-h overflow-y-auto">
      {#each filters as filter}
        {#if filter instanceof Array}
          <div class="flex flex-wrap md:flex-nowrap items-center gap-x-0 md:gap-x-5">
            {#each filter as filter}
              <Item bind:filter />
            {/each}
          </div>
        {:else}
          <Item bind:filter />
        {/if}
      {/each}
    </div>
    <button
      type="submit"
      class="btn mx-1 w-full border-2 normal-border bg-base-100 hover:btn-outline my-2"
      on:click={() => (open = false)}
    >
      {$t('common.search')}
    </button>
  </div>
</div>

<style>
  .max-h {
    max-height: min(75vh, calc(100vh - 219px));
  }
</style>
