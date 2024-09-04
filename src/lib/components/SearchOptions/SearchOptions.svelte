<script lang="ts">
  import { t } from '$lib/translations/config';
  import type { ParsedQuery } from 'query-string';
  import { superForm } from 'sveltekit-superforms/client';
  import { range } from '$lib/utils';
  import Item from './Item.svelte';

  import type { IFilters } from './types';

  export const filters: IFilters = [
    {
      type: 'input',
      label: 'text',
      value: 1,
      param: 'text',
      options: {
        inputType: 'text',
        range: [0, 4],
      },
    },
    {
      type: 'input',
      label: 'number',
      value: 1,
      param: 'number',
      options: {
        inputType: 'number',
        range: [0, 4],
      },
    },
    {
      type: 'toggle',
      label: 'chek',
      value: false,
      param: 'chek',
    },
    [
      {
        type: 'toggle',
        label: 'toggle 1',
        value: false,
        param: 'toggle1',
      },
      {
        type: 'toggle',
        label: 'toggle 2',
        value: true,
        param: 'toggle2',
      },
    ],

    {
      type: 'select',
      label: 'select',
      value: 'sel0',
      param: 'select',
      items: {
        sel0: 'select 0',
        sel1: 'select 1',
      },
    },

    {
      type: 'slider',
      label: 'difficulty',
      value: [0, 1],
      param: ['MinDifficulty', 'MaxDifficulty'],
      options: {
        step: 0.1,
        isRange: true,
        range: [0, 17],
        pipstep: 10,
      },
    },
    {
      type: 'slider',
      label: 'slid',
      value: [1],
      param: ['slid'],
      options: {
        range: [0, 10],
      },
    },
    {
      type: 'slider',
      label: 'slid2',
      value: [1, 5],
      param: ['slid2-1', 'slid2-2'],
      options: {
        range: [0, 10],
      },
    },
    {
      type: 'radio',
      label: 'radi',
      value: 'ra0',
      param: 'ra',
      items: {
        ra0: 'radio 0',
        ra1: 'radio 1',
      },
    },
  ];

  let params: URLSearchParams = new URLSearchParams();

  $: {
    filters.flat().forEach((filter) => {
      const { type, value, param } = filter;
      if (value instanceof Array) value.forEach((v, i) => params.set(param[i], v.toString()));
      else if (!(param instanceof Array)) params.set(param, value.toString());
    }); //todo
    params = params;
  }
  $: console.log(filters);
  $: console.log(params);

  let open = true;
</script>

<div class="collapse collapse-arrow bg-base-100 my-4 rounded-box w-full self-center">
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title texl-xl">{$t('common.search_options')}</div>
  <div class="collapse-content">
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
