<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips';
  import type { IFilter } from './types';
  import Input from './Input.svelte';
  import { t } from '$lib/translations/config';

  export let filter: IFilter;

  const joinTypes: IFilter['type'][] = ['input', 'input_group', 'select'];
</script>

{#if filter}
  {@const { type, label } = filter}

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label
    class="label text-sm md:text-md w-full md:join-horizontal md:flex-nowrap rounded-xl transition"
    class:join={joinTypes.includes(type)}
    class:join-vertical={type == 'input_group'}
    class:flex-wrap={['slider', 'radio'].includes(type)}
    class:hover:bg-base-300={['toggle'].includes(type)}
    class:cursor-pointer={['toggle'].includes(type)}
    class:my-1={['toggle'].includes(type)}
    class:px-3={['toggle', 'radio', 'slider'].includes(type)}
  >
    <span
      class={'label-text no-animation join-item whitespace-nowrap md:w-1/4 text-left'}
      class:btn={joinTypes.includes(type)}
      class:w-16={type !== 'input_group'}
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
      <select
        bind:value={filter.value}
        class="select transition border-2 normal-border hover:select-secondary join-item flex-grow"
      >
        {#each Object.entries(filter.items) as [selectValue, selectLabel], i}
          <option value={selectValue}>{$t(selectLabel)}</option>
        {/each}
      </select>
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
          springValues={{ stiffness: 0.15, damping: 0.7 }}
        />
      </div>
    {:else if filter.type === 'toggle'}
      <input type="checkbox" bind:checked={filter.value} class="toggle border-2" />
    {:else if filter.type === 'radio'}
      <div class="flex flex-grow flex-wrap">
        {#each Object.keys(filter.items) as radioValue, i}
          {@const radioLabel = filter.items[radioValue]}
          <label
            class="label flex-grow cursor-pointer rounded-xl transition hover:bg-base-300 px-3 mx-1"
          >
            <span class="label-text">
              {$t(radioLabel)}
            </span>
            <input
              type="radio"
              name={label}
              class="radio border-2"
              bind:group={filter.value}
              value={radioValue}
            />
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
</style>
