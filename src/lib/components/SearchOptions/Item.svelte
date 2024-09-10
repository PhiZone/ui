<script lang="ts">
  import Select from 'svelte-select'
  import RangeSlider from 'svelte-range-slider-pips';
  import type { IFilter } from './types';
  import Input from './Input.svelte';
  import { t } from '$lib/translations/config';

  export let filter: IFilter;

  const joinTypes: IFilter['type'][] = ['input', 'input_group', 'select'];
    
  $: console.log(filter.value)

</script>

{#if filter}
  {@const { type, label, options } = filter}

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label
    class="label text-sm md:text-md w-full md:join-horizontal md:flex-nowrap rounded-xl transition"
    class:join={joinTypes.includes(type)}
    class:join-vertical={type == 'input_group' || (type=='select'&&options?.isMultiple)}
    class:flex-wrap={['slider', 'radio'].includes(type)}
    class:hover:bg-base-300={['toggle'].includes(type)}
    class:cursor-pointer={['toggle'].includes(type)}
    class:my-1={['toggle'].includes(type)}
    class:px-3={['toggle', 'radio', 'slider'].includes(type)}
  >
    <span
      class={'label-text no-animation join-item whitespace-nowrap md:w-1/4 text-left'}
      class:btn={joinTypes.includes(type)}
      class:w-16={!(type == 'input_group' || (type=='select'&&options?.isMultiple))}
    >
      {$t(label)}
    </span>
    {#if filter.type === 'input'}
      <Input bind:filter />
    {:else if filter.type === 'input_group'}
      {#each filter.items as item}
        <Input bind:filter={item} />
      {/each}
    {:else if filter.type === 'select'}
        <!--TODO: bind:value causing infinite loop-->
        <!--<Select class='select select-bordered join-item' on:clear={({detail})=>fitter.value = filter.value.filter((v)=>!(detail instanceof Array && detail.includes(v) || detail == v))} on:change={({detail})=>filter.value = detail} items={filter.items} multiple={options?.isMultiple} --list-z-index='5'/> -->
        <Select class=' join-item' value={filter.value} items={filter.items} multiple={options?.isMultiple} --list-z-index='5'/>
    {:else if filter.type === 'slider'}
      {@const {
        range: [min, max],
        step = 1,
        pipstep = 1,
        isRange = false,
      } = filter.options}
      <div class="daisy-ui text-sm md:text-base w-full cursor-pointer">
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
          springValues={{ stiffness: 0.15, damping: 0.9 }}
        />
      </div>
    {:else if filter.type === 'toggle'}
      <input type="checkbox" bind:checked={filter.value} class="toggle border-2" />
    {:else if filter.type === 'radio' || filter.type === 'checkbox'}
      <div class="flex flex-grow flex-wrap">
        {#each filter.items as item, i}
          <label
            class="label flex-grow cursor-pointer rounded-xl transition hover:bg-base-300 px-3 mx-1"
          >
            <span class="label-text">
              {$t(item.label)}
            </span>
            {#if filter.type=== 'radio'}
                <input type="radio"
                  name={label}
                  class="radio border-2"
                  bind:group={filter.value}
                  value={item.value}
                />
            {:else}
                <input type="checkbox"
                  name={label}
                  class="checkbox border-2"
                  bind:group={filter.value}
                  value={item.value}
                />
            {/if}
          </label>
        {/each}
      </div>
    {/if}
  </label>
{/if}

<style>
  .daisy-ui :global(.rangeSlider) {
    overflow: visible;
    width: unset;
  }

    :global(:root) {
        --range-slider:            oklch(var(--b2));
        --range-handle-inactive:   oklch(var(--bc));
        --range-handle:            oklch(var(--s));
        --range-handle-focus:      oklch(var(--s));
        --range-handle-border:     oklch(var(--s));
        --range-range-inactive:    oklch(var(--bc)/0.5);
        --range-range:             oklch(var(--s)/0.5);
        --range-float-inactive:    oklch(var(--s));
        --range-float:             oklch(var(--s));
        --range-float-text:        oklch(var(--sc));

        --range-pip:               oklch(var(--bc)/0.7);
        --range-pip-text:          oklch(var(--bc)/0.7);
        --range-pip-active:        oklch(var(--bc)/0.8);
        --range-pip-active-text:   oklch(var(--bc)/0.8);
        --range-pip-hover:         oklch(var(--bc)/0.9);
        --range-pip-hover-text:    oklch(var(--bc)/0.9);
        --range-pip-in-range:      oklch(var(--bc));
        --range-pip-in-range-text: oklch(var(--bc));
      }
</style>
