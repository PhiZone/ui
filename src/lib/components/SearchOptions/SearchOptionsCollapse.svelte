<script lang="ts">
  import type { SearchFilterType } from '$lib/filters';

  import { generateParams, getFilterValue, getFullFilters, storeFilterValue } from '$lib/filters';
  import { t } from '$lib/translations/config';

  import Item from './Item.svelte';

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

<div
  class="collapse collapse-arrow collapse-transition bg-base-100 my-4 rounded-box w-full self-center border-2 normal-border"
  class:hover:border-secondary={!open}
>
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title texl-xl bg-base-200">
    {$t('common.search_options')}
  </div>
  <div class="collapse-content px-0 md:px-4 overflow-y-auto">
    <div class="form-control items-stretch w-full">
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
      <button
        type="submit"
        class="btn mx-1 border-2 normal-border bg-base-100 hover:btn-outline my-2"
        on:click={() => (open = false)}
      >
        {$t('common.search')}
      </button>
    </div>
  </div>
</div>
