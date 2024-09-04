<script lang="ts">
  import { t } from '$lib/translations/config';
  import type { ParsedQuery } from 'query-string';
  import { superForm } from 'sveltekit-superforms/client';
  import { range } from '$lib/utils';
  import Item from './Item.svelte';

  import type { IFilter,IFilters,IFilterInputGroup } from './types';

  export let filters: IFilters;

  export let params: URLSearchParams = new URLSearchParams();

  $: {
    filters.flat().forEach((filter) => {
		if(filter.type == 'input_group') filter.items.forEach(({param,value})=>{
		  if (!value || value == '__unset') params.delete(param);
		  else params.set(param,value.toString());
		});
		
		else{

		  const { value, param } = filter;
		  if (value ==''||value == '__unset') params.delete(param);
		  else if (value instanceof Array) value.forEach((v, i) => {
			  params.set(param[i], v.toString())
		  });
		  else if (!(param instanceof Array)) params.set(param, value.toString());
		}
	});
	params = params;
  }
  $: console.log(filters);
  $: console.log(params);

  let open = true;

  function generateParam(filter:IFilter,params:URLSearchParams){

	  return params;
  }
</script>

<div class="collapse collapse-arrow bg-base-100 my-4 rounded-box w-full self-center overflow-y-auto">
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title texl-xl">{$t('common.search_options')}</div>
  <div class="collapse-content md:px-2">
    <div class="form-control items-stretch w-full">
      {#each filters as filter}
        {#if filter instanceof Array}
          <div class="flex items-center gap-x-5">
            {#each filter as filter}
              <Item bind:filter />
            {/each}
          </div>
        {:else}
          <Item bind:filter />
        {/if}
      {/each}
      <!--<label class="label join text-sm md:text-md cursor-pointer">-->
      <!--<span class="label-text btn no-animation join-item whitespace-nowrap">order</span>-->
      <!--<select-->
      <!--class="select select-ghost select-bordered select-sm md:select-md join-item flex-grow w-0"-->
      <!--name="order_by"-->
      <!--value={params?.order_by || orders[0].value}-->
      <!-->-->
      <!--{#each orders as order}-->
      <!--<option value={order.value}>{order.name}</option>-->
      <!--{/each}-->
      <!--</select>-->
      <!--<select-->
      <!--class="select select-ghost select-bordered select-sm md:select-md join-item flex-grow w-0"-->
      <!--name="order"-->
      <!--value={params?.order || 'asc'}-->
      <!-->-->
      <!--<option value="asc">{$t('common.ascending')}</option>-->
      <!--<option value="desc">{$t('common.descending')}</option>-->
      <!--</select>-->
      <!--</label>-->
      <button type="submit" class="btn btn-secondary" on:click={() => (open = false)}>
        search
      </button>
    </div>
  </div>
</div>
