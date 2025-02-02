<script lang="ts">
  import type { IFilter } from '$lib/filters/types';

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
        class="checkbox tooltip before:z-10"
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
    <slot />
  </label>
{/if}
