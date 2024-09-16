<script lang="ts">
  import { t } from '$lib/translations/config';
  import Item from './Item.svelte';

  import type { IFilters } from '$lib/filters/types';
  import { getFilterValue, storeFilterValue } from '$lib/filters';
  import type { SearchFilterType } from '$lib/filters';

  export let type: SearchFilterType;
  export let filters: IFilters;
  export let params: URLSearchParams = new URLSearchParams();

  $: filters;
  $: data = getFilterValue(filters);

  $: {
    params = new URLSearchParams();

    Object.entries(data).forEach(([param, value]) => {
      if (param === 'Order') {
        value.forEach(({ value: { field, desc } }) => {
          params.append('Order', field);
          params.append('Desc', desc.toString());
        });
      } else if (value instanceof Array) {
        value.forEach((v) => {
          if (v.value) params.append(param, v.value);
          else params.append(param, v);
        });
      } else {
        params.append(param, value.toString());
      }
    });

    console.log(params);
    storeFilterValue(type, data);
  }

  let open = true;
</script>

<div class="collapse collapse-arrow bg-base-100 my-4 rounded-box w-full self-center">
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title texl-xl bg-base-200">{$t('common.search_options')}</div>
  <div class="collapse-content px-0 md:px-4 max-h-[50vh] overflow-y-auto">
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
        class="btn border-2 normal-border bg-base-100 hover:btn-outline my-2"
        on:click={() => (open = false)}
      >
        {$t('common.search')}
      </button>
    </div>
  </div>
</div>
