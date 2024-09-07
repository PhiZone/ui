<script lang="ts">
  import { t } from '$lib/translations/config';
  import type { IFilterInput } from './types';

  export let filter: Omit<Omit<IFilterInput, 'label'>, 'type'>;
</script>

{#if filter?.options?.inputType == 'number'}
  <input
    type="number"
    placeholder={filter.options.placeholder ? $t(filter.options.placeholder) : ''}
    bind:value={filter.value}
    min={filter.options.range?.[0]}
    max={filter.options.range?.[1]}
    class="input transition border-2 normal-border hover:input-secondary join-item flex-grow"
  />
{:else}
  <input
    type="text"
    placeholder={filter.options.placeholder ? $t(filter.options.placeholder) : ''}
    bind:value={filter.value}
    minlength={filter.options.range?.[0]}
    maxlength={filter.options.range?.[1]}
    class="input transition border-2 normal-border hover:input-secondary join-item flex-grow"
  />
{/if}
