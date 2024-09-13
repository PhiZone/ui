<script lang="ts">
  import Select from 'svelte-select';
  import Svelecte from 'svelecte';
  import RangeSlider from 'svelte-range-slider-pips';
  import type { IFilter } from './types';
  import Input from './Input.svelte';
  import { t } from '$lib/translations/config';

  export let filter: IFilter;

  const joinTypes: IFilter['type'][] = ['input', 'input_group', 'select'];

  function enable() {
    if (!filter.isEnable)
      setTimeout(() => {
        filter.isEnable = true;
      }, 100);
  }
</script>

{#if filter}
  {@const { type, label, isEnable, options } = filter}
  {@const isJoinType = joinTypes.includes(type)}

  <!-- svelte-ignore a11y-label-has-associated-control -->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <label
    class="label text-sm md:text-md w-full md:join-horizontal flex-wrap md:flex-nowrap rounded-xl transition"
    class:opacity-50={!isEnable}
    class:join={isJoinType}
    class:flex-wrap={!isJoinType}
    class:hover:bg-base-300={['toggle'].includes(type)}
    class:cursor-pointer={['toggle'].includes(type)}
    class:my-1={['toggle'].includes(type)}
    class:px-5={!isJoinType}
    class:gap-2={!isJoinType}
    class:join-vertical={type == 'input_group' || (type == 'select' && options?.isMultiple)}
    for={filter.param ?? filter.label}
    on:mousedown={enable}
    on:click={enable}
  >
    <span
      class={'inline-flex flex-nowrap label-text no-animation join-item whitespace-nowrap md:w-1/4 text-left align-middle'}
      class:btn={isJoinType}
    >
      <input
        type="checkbox"
        class="checkbox tooltip before:z-10"
        data-tip={isEnable ? $t('common.disable_option') : $t('common.enable_option')}
        bind:checked={filter.isEnable}
      />
      <span class="flex-1" class:ml-3={!isJoinType} class:text-center={isJoinType}>
        {$t(label)}
      </span>
    </span>
    {#if filter.type === 'input'}
      <Input bind:filter />
    {:else if filter.type === 'input_group'}
      {#each filter.items as item}
        <Input bind:filter={item} />
      {/each}
    {:else if filter.type === 'select'}
      <Svelecte
        class="join-item flex-1 w-full input input-bordered transition hover:input-secondary m-0 p-0 leading-5 md:leading-7 md:text-md"
        bind:value={filter.value}
        options={filter.items}
        multiple={options?.isMultiple}
      />
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
      <input
        type="checkbox"
        bind:checked={filter.value}
        class="toggle border-2"
        name={filter.param}
      />
    {:else if filter.type === 'radio' || filter.type === 'checkbox'}
      <div class="flex flex-grow flex-wrap flex-col md:flex-row">
        {#each filter.items as item, i}
          <label
            class="label flex-grow cursor-pointer rounded-xl transition hover:bg-base-300 px-3 mx-1"
          >
            <span class="label-text">
              {$t(item.label)}
            </span>
            {#if filter.type === 'radio'}
              <input
                type="radio"
                name={label}
                class="radio border-2"
                bind:group={filter.value}
                value={item.value}
              />
            {:else}
              <input
                type="checkbox"
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

  :global(.svelecte .is-open) {
    z-index: 5 !important;
  }
  :global(.svelecte .sv-control, .sv-buttons) {
    background-color: transparent !important;
    border: 0 !important;
    height: 100%;
  }

  :root {
    --range-slider: oklch(var(--b2));
    --range-handle-inactive: oklch(var(--bc));
    --range-handle: oklch(var(--s));
    --range-handle-focus: oklch(var(--s));
    --range-handle-border: oklch(var(--s));
    --range-range-inactive: oklch(var(--bc) / 0.5);
    --range-range: oklch(var(--s) / 0.5);
    --range-float-inactive: oklch(var(--s));
    --range-float: oklch(var(--s));
    --range-float-text: oklch(var(--sc));

    --range-pip: oklch(var(--bc) / 0.7);
    --range-pip-text: oklch(var(--bc) / 0.7);
    --range-pip-active: oklch(var(--bc) / 0.8);
    --range-pip-active-text: oklch(var(--bc) / 0.8);
    --range-pip-hover: oklch(var(--bc) / 0.9);
    --range-pip-hover-text: oklch(var(--bc) / 0.9);
    --range-pip-in-range: oklch(var(--bc));
    --range-pip-in-range-text: oklch(var(--bc));

    --sv-min-height: 40px;
    --sv-bg: oklch(var(--b2));
    --sv-color: oklch(var(--bc));
    --sv-disabled-bg: #eee;
    --sv-border: 1px solid #ccc;
    --sv-border-radius: 4px;
    --sv-general-padding: 4px;
    --sv-control-bg: var(--sv-bg);
    --sv-item-wrap-padding: 3px 3px 3px 6px;
    --sv-item-selected-bg: oklch(var(--b2));
    --sv-item-btn-color: oklch(var(--bc));
    --sv-item-btn-color-hover: oklch(var(--sc)); /* same as icon-color-hover in default theme */
    --sv-item-btn-bg: oklch(var(--b2));
    --sv-item-btn-bg-hover: oklch(var(--s));
    --sv-icon-color: oklch(var(--bc));
    --sv-icon-color-hover: oklch(var(--s));
    --sv-icon-bg: transparent;
    --sv-icon-size: 20px;
    --sv-separator-bg: #ccc;
    --sv-btn-border: 0;
    --sv-placeholder-color: oklch(var(--bc) / 0.5);
    --sv-dropdown-bg: var(--sv-bg);
    --sv-dropdown-offset: 1px;
    --sv-dropdown-border: 1px solid rgba(0, 0, 0, 0.15);
    --sv-dropdown-width: auto;
    --sv-dropdown-shadow: 0 6px 12px #0000002d;
    --sv-dropdown-height: 320px;
    --sv-dropdown-active-bg: oklch(var(--b1));
    --sv-dropdown-selected-bg: oklch(var(--b1));
    /*--sv-create-kbd-border: 1px solid #efefef;*/
    /*--sv-create-kbd-bg: #fff;*/
    /*--sv-create-disabled-bg: #fcbaba;*/
    /*--sv-loader-border: 2px solid #ccc;*/
  }
</style>
