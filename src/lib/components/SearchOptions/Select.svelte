<script lang="ts">
  import Svelecte from 'svelecte';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';

  import type { IFilterSelect } from '$lib/filters/types';

  import { t } from '$lib/translations/config';

  export let filter: IFilterSelect;

  overrideItemIdKeyNameBeforeInitialisingDndZones('id');

  const optionResolver = (opt: { label: string }[]) => {
    if (opt)
      return opt.map((o: { label: string }) => ({
        id: o.label,
        ...o,
        label: $t(o.label),
        rawLabel: o.label,
      })); // translate label
    return [];
  };
</script>

<Svelecte
  class="join-item flex-1 w-full input border-2 normal-border min-h-[3rem] h-fit transition hover:input-secondary m-0 p-0 leading-5 md:leading-7 md:text-md"
  {optionResolver}
  name={filter.param}
  dndzone={filter?.options?.multiple ? dndzone : undefined}
  highlightFirstItem={false}
  valueAsObject
  placeholder={filter.options?.placeholder ??
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    $t('common.select.placeholder', { item: $t(filter.label) })}
  i18n={{
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    max: (max) => $t('common.select.most', { max }),
    empty: $t('common.select.empty'),
    nomatch: $t('common.select.nomatch'),
  }}
  {...filter.options}
  bind:value={filter.value}
  options={filter.items}
/>
