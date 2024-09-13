<script lang="ts">
  import { t } from '$lib/translations/config';
  import Item from './Item.svelte';

  import type { IFilter, IFilters, IFilterInputGroup } from './types';

  export let filters: IFilters;

  export let params: URLSearchParams = new URLSearchParams();

  $:filters, params = generateParams()

  function generateParams() {
    params = new URLSearchParams();
    filters.flat().forEach((filter) => {
      if(!filter.isEnable) return;
      if (filter.type == 'input_group')
        filter.items.forEach(({ param, value }) => {
          if (!value || value == '__unset') params.delete(param);
          else params.set(param, value.toString());
        });
      else {
        const { value, param } = filter;
        if (value instanceof Array) {
          if (param instanceof Array) {
            value.forEach((v, i) => {
              params.set(param[i], v.value ?? v.toString());
            });
          } else {
            value.forEach((v, i) => {
              params.append(param, v.value ?? v.toString());
            });
          }
        } else if (value === null || value === '' || value === '__unset') params.delete(param);
        else params.set(param, (value as any).toString());
      }
    });
    console.info(params)
    return params
    //console.info(filters)
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
