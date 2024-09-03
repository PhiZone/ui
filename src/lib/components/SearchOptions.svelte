<script lang="ts">
  import { t } from '$lib/translations/config';
  import type { ParsedQuery } from 'query-string';
  import { superForm } from 'sveltekit-superforms/client';
  import RangeSlider from 'svelte-range-slider-pips';
  import { range } from '$lib/utils';

  type Items = Record<string,string>; // value: label

  interface IFilterBase {
    label: string;
    value: any;
	param: string[]|string; // converting the value to the corresponding param
    type: string; // 'input' | 'number' | 'range' | 'slider' | 'checkbox' | 'radio' | 'select' | 'switch'
    options?: object;
  }

  interface IFilterInput extends IFilterBase {
    type: 'input';
    value: string | number;
    options: {
      inputType: 'number' | 'text';
      isInt?: boolean;
      range?: [min: number, max: number];
    };
  }

  interface IFilterSelect extends IFilterBase {
      type:'select';
      value: string;
      param: string;
      items: Items;


  }

  interface IFilterToggle extends IFilterBase {
    type: 'toggle';
    value: boolean;
    param: string;
  }


  interface IFilterSlider extends IFilterBase {
    type: 'slider';
	value: [low: number, high: number] | number[];
    options: {
      step?: number;
	  isRange?: boolean;
      range?: [min: number, max: number];
      pipstep?: number;
    };
  }
  /** TODO unknown relationship between param and value
 interface IFilterCheckbox extends IFilterBase {
      type: 'checkbox';
      value: (keyof this['items'])[]; // selected ones
      param: string[];
      items: Record<string, string>; // value: label
  }
   */

  interface IFilterRadio extends IFilterBase {
      type: 'radio';
      value: keyof this['items']; // selected one
      param: string;
      items: Record<string, string>; // value: label
  }

  type IFilter = IFilterInput | IFilterSelect | IFilterSlider | IFilterToggle | IFilterRadio


  export const filters: IFilter[] = [
    {
      type: 'input',
      label: 'name',
      value: 1,
	  param: 'name',
      options: {
        inputType: 'number',
        range: [0, 4],
      },
    },
    {
		type:'toggle',
		label: 'chek',
		value: false,
		param: 'chek'
	},

    {
      type: 'select',
      label: 'select',
      value: 'sel0',
	  param: 'select',
      items: {
          sel0: 'select 0',
          sel1: 'select 1',
      }
    },

    {
      type: 'slider',
      label: 'difficulty',
      value: [0, 1],
	  param: ['MinDifficulty','MaxDifficulty'],
      options: {
        step: 0.1,
		isRange: true,
        range: [0, 17],
        pipstep: 10,
      },
    },
	{
		type:'slider',
		label:'slid',
		value: [1],
        param: ['slid'],
        options:{
            range:[0,10]
        }
	},{
		type:'slider',
		label:'slid2',
		value: [1,5],
        param: ['slid2-1','slid2-2'],
        options:{
            range:[0,10]
        }
    }
    ,{
        type:'radio',
        label: 'radi',
        value: 'ra0',
        param: 'ra',
        items: {
            ra0: 'radio 0',
            ra1: 'radio 1',
        }
    }

      ];

  // export let orders: Order[];

   let params: URLSearchParams =new URLSearchParams();

  $: {
	filters.forEach((filter)=>{
        const {type,value,param} = filter;
            if(value instanceof Array) value.forEach((v,i) => params.set(param[i],v.toString()))
		  else if(! (param instanceof Array)) params.set(param,value.toString()) 
	});//todo
	  params=params;
  } 
  $: console.log(filters)
  $: console.log(params)

  let open = true;

</script>

<div class="collapse collapse-arrow bg-base-100 my-4 rounded-box w-full self-center">
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title texl-xl">{$t('common.search_options')}</div>
  <div class="collapse-content">
    <form class="form-control items-stretch w-full">
      {#each filters as filter}
        {@const { label, options } = filter}
        <label class="label text-sm md:text-md cursor-pointer" class:join={filter.type==='input'}>
          <span class="label-text btn no-animation join-item whitespace-nowrap">{label}</span>
          {#if filter.type === 'input'}
            {@const { range } = options}
            {#if options.inputType == 'number'}
              <input
                type="number"
                placeholder={label}
                bind:value={filter.value}
                min={range?.[0]}
                max={range?.[1]}
                class="input input-ghost input-bordered input-sm md:input-md join-item flex-grow w-0"
              />
            {:else}
              <input
                type="text"
                placeholder={label}
                bind:value={filter.value}
                minlength={range?.[0]}
                maxlength={range?.[1]}
                class="input input-ghost input-bordered input-sm md:input-md join-item flex-grow w-0"
              />
            {/if}
          {:else if filter.type === 'select'}
              <select bind:value={filter.value}>
            {#each Object.keys(filter.items) as selectValue, i}
                {@const selectLabel = filter.items[selectValue]}
                <option value={selectValue}>{selectLabel}</option>
            {/each}
              </select>
          {:else if filter.type === 'slider'}
            {@const { range:[min,max],step = 1 ,pipstep = 1, isRange = false } = options}
            <div class="daisy-ui flex-grow w-0">
              <RangeSlider
                bind:values={filter.value}
				{step}
				{min}
				{max}
				{pipstep}
                pips
                all="label"
                range={isRange}
                pushy
                float
                springValues={{ stiffness: 0.15, damping: 0.7 }}
              />
            </div>
     {:else if filter.type === 'toggle'}
			  <input type="checkbox" bind:checked={filter.value} class="toggle" />
            <!--<select-->
            <!--class="select select-ghost select-bordered select-sm md:select-md join-item flex-grow w-0"-->
            <!--name={filter.value}-->
            <!--value={params?.[filter.value] ?? ''}-->
            <!-->-->
            <!--<option />-->
            <!--{#each filter.options as option}-->
            <!--<option value={option.value}>{option.name}</option>-->
            <!--{/each}-->
            <!--</select>-->
    {:else if filter.type === 'radio'}
        {#each Object.keys(filter.items) as radioValue, i}
            {@const radioLabel = filter.items[radioValue]}
            <label>
                {radioLabel}
                <input type="radio" name={label} class="radio" bind:group={filter.value} value={radioValue}/>
            </label>

        {/each}
	{:else}
          {/if}
        </label>
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
    </form>
  </div>
</div>

<style>
  .daisy-ui :global(.rangeSlider) {
    overflow: visible;
    width: unset;
  }
</style>
