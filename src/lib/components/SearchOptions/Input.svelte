<script lang="ts">
  import type { IFilterInput } from '$lib/filters/types';

  import { t } from '$lib/translations/config';

  interface Props {
    filter: Omit<Omit<IFilterInput, 'label'>, 'type'>;
  }
  let { filter = $bindable() }: Props = $props();

  let type = $state('input');
  let placeholder = filter.options.placeholder ? $t(filter.options.placeholder) : '';
</script>

{#if filter?.options?.inputType == 'number'}
  <input
    type="number"
    name={filter.param}
    {placeholder}
    bind:value={filter.value}
    min={filter.options.range?.[0]}
    max={filter.options.range?.[1]}
    class="input border-2 normal-border min-w-0 transition hover:input-secondary join-item flex-1"
  />
{:else}
  <input
    {...{ type }}
    name={filter.param}
    {placeholder}
    bind:value={filter.value}
    minlength={filter.options.range?.[0]}
    maxlength={filter.options.range?.[1]}
    class="input border-2 normal-border min-w-0 transition hover:input-secondary join-item flex-1"
    onfocus={() => (type = filter.options.inputType)}
    onfocusout={() => (type = filter.value ? type : 'input')}
  />
{/if}
