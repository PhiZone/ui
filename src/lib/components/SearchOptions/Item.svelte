<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips';
  import type { IFilter } from './types';

  export let filter: IFilter;

  const joinTypes: IFilter['type'][] = ['input', 'select'];
</script>

{#if filter}
  {@const { type, label } = filter}

  <label
    class="label text-sm md:text-md cursor-pointer w-full"
    class:join={joinTypes.includes(type)}
  >
    <span
      class="label-text no-animation join-item whitespace-nowrap w-1/4 min-w-[64px] text-left"
      class:btn={joinTypes.includes(filter.type)}
      class:px-5={!joinTypes.includes(filter.type)}
    >
      {label}
    </span>
    {#if filter.type === 'input'}
      {@const { range, inputType } = filter.options}
      {#if inputType == 'number'}
        <input
          type="number"
          placeholder={label}
          bind:value={filter.value}
          min={range?.[0]}
          max={range?.[1]}
          class="input input-ghost input-bordered join-item flex-grow w-0"
        />
      {:else}
        <input
          type="text"
          placeholder={label}
          bind:value={filter.value}
          minlength={range?.[0]}
          maxlength={range?.[1]}
          class="input input-ghost input-bordered join-item flex-grow w-0"
        />
      {/if}
    {:else if filter.type === 'select'}
      <select bind:value={filter.value} class="select select-bordered join-item flex-grow w-0">
        {#each Object.keys(filter.items) as selectValue, i}
          {@const selectLabel = filter.items[selectValue]}
          <option value={selectValue}>{selectLabel}</option>
        {/each}
      </select>
    {:else if filter.type === 'slider'}
      {@const {
        range: [min, max],
        step = 1,
        pipstep = 1,
        isRange = false,
      } = filter.options}
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
      <input type="checkbox" bind:checked={filter.value} class="toggle togggle-bordered" />
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
          <input
            type="radio"
            name={label}
            class="radio"
            bind:group={filter.value}
            value={radioValue}
          />
        </label>
      {/each}
    {/if}
  </label>
{/if}

<style>
  .daisy-ui :global(.rangeSlider) {
    overflow: visible;
    width: unset;
  }
</style>
