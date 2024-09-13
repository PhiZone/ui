<script lang="ts">
  import { t } from '$lib/translations/config';
  import type { IFilterInput } from '$lib/filters/types';

  export let filter: Omit<Omit<IFilterInput, 'label'>, 'type'>;
</script>

{#if filter?.options?.inputType == 'number'}
  <input
    type="number"
    name={filter.param}
    placeholder={filter.options.placeholder ? $t(filter.options.placeholder) : ''}
    bind:value={filter.value}
    min={filter.options.range?.[0]}
    max={filter.options.range?.[1]}
    class="input input-bordered min-w-0 transition hover:input-secondary join-item flex-grow"
  />
{:else}
  <input
    type="text"
    name={filter.param}
    placeholder={filter.options.placeholder ? $t(filter.options.placeholder) : ''}
    bind:value={filter.value}
    minlength={filter.options.range?.[0]}
    maxlength={filter.options.range?.[1]}
    class="input input-bordered min-w-0 transition hover:input-secondary join-item flex-grow"
  />
{/if}
