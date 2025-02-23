<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import Svelecte from 'svelecte';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';

  import type { IFilterOrder, IFilterOrderItem } from '$lib/filters/types';

  import { t } from '$lib/translations/config';

  interface Props {
    filter: IFilterOrder;
  }
  let { filter = $bindable() }: Props = $props();

  let count = $state(0); // only for update component

  overrideItemIdKeyNameBeforeInitialisingDndZones('id');

  const reverse = (id?: number | string) => {
    if (id === null || id === undefined) return;
    const item = filter.value.find(({ id: _id }) => _id === id) as IFilterOrderItem;
    if (item) {
      item.value.desc = !item.value.desc;
      count = count + 1;
    }
  };

  function clickHandler(e: MouseEvent) {
    const orderingEl = (e.target as HTMLElement)?.closest('[data-item-id]');
    if (!orderingEl) return;

    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    reverse((orderingEl as HTMLElement).dataset.itemId);
  }

  const clickBind = (node: HTMLElement) => {
    node.addEventListener('click', clickHandler, { capture: true });
    return {
      destroy() {
        node.removeEventListener('click', clickHandler, { capture: true });
      },
    };
  };
  const renderer: ComponentProps<typeof Svelecte>['renderer'] = (
    item,
    _isSelection,
    _inputValue,
  ) => {
    const {
      id,
      label,
      value: { desc },
    } = item as IFilterOrderItem;
    const text: string = t.get(label);
    const type = desc ? 'desc' : 'asc';
    const arrow = desc ? '↓' : '↑';
    if (_isSelection) return `<span class='${type}' data-item-id='${id}'>${arrow} ${text}</span>`;
    return text;
  };
</script>

<div use:clickBind class="join-item contents">
  {#key count}
    <Svelecte
      class="flex-1 w-full input border-2 normal-border min-h-[3rem] h-fit transition hover:input-secondary m-0 p-0 rounded-[inherit] leading-5 md:leading-7 md:text-md"
      name={filter.param}
      dndzone={filter?.options?.multiple ? dndzone : undefined}
      highlightFirstItem={false}
      {...filter.options}
      valueAsObject
      bind:value={filter.value}
      options={filter.items}
      {renderer}
      optionResolver={(opt) => opt}
      placeholder={filter.options?.placeholder ??
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        $t('common.select.placeholder', { item: $t(filter.label) })}
      i18n={{
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        max: (max) => $t('common.select.max', { max }),
        empty: $t('common.select.empty'),
        nomatch: $t('common.select.nomatch'),
      }}
      max={filter.options?.max ?? 5}
      multiple
    />
  {/key}
</div>
