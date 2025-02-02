<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips';

  import type { IFilter } from '$lib/filters/types';

  import { isOrderFilter } from '$lib/filters';
  import { t } from '$lib/translations/config';

  import Input from './Input.svelte';
  import Order from './Order.svelte';
  import Select from './Select.svelte';

  export let filter: IFilter;

  const joinTypes: IFilter['type'][] = ['input', 'input_group', 'select'];

  const enable = (event: Event) => {
    const target = event.target as HTMLElement;
    if (target && target.closest('.no-enable')) {
      return;
    }
    if (!filter.isEnable) {
      setTimeout(() => {
        filter.isEnable = true;
      }, 100);
    }
  };
</script>

{#if filter}
  {@const { type, label, isEnable, options } = filter}
  {@const withJoin = joinTypes.includes(type)}
  {@const withVertical = type == 'input_group' || (type == 'select' && options?.multiple)}

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <label
    class="label text-sm md:text-md w-full md:join-horizontal rounded-xl transition"
    class:opacity-50={!isEnable}
    class:join={withJoin}
    class:flex-wrap={!withJoin}
    class:hover:bg-base-300={['toggle'].includes(type)}
    class:cursor-pointer={['toggle'].includes(type)}
    class:my-1={['toggle'].includes(type)}
    class:px-5={!withJoin}
    class:gap-2={!withJoin}
    class:join-vertical={withVertical}
    for={filter.param instanceof Array ? filter.param[0] : (filter.param ?? filter.label)}
    on:mousedown={enable}
    on:click={enable}
  >
    <span
      class={'inline-flex flex-nowrap label-text no-animation join-item whitespace-nowrap min-w-[40%] md:w-1/4 h-[unset] text-left align-middle'}
      class:btn={withJoin}
    >
      <input
        type="checkbox"
        class="checkbox border-2 tooltip before:z-10 no-enable"
        data-tip={isEnable ? $t('common.disable_option') : $t('common.enable_option')}
        bind:checked={filter.isEnable}
      />
      <span
        class="flex-1 md:mr-0"
        class:ml-3={!withJoin}
        class:mr-6={withVertical && withJoin}
        class:text-center={withJoin}
      >
        {$t(label)}
      </span>
    </span>
    {#if filter.type === 'input'}
      <Input bind:filter />
    {:else if filter.type === 'input_group'}
      {#each filter.items as item}
        <Input bind:filter={item} />
      {/each}
    {:else if isOrderFilter(filter)}
      <Order bind:filter />
    {:else if filter.type === 'select'}
      <Select bind:filter />
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
        {#each filter.items as item}
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
