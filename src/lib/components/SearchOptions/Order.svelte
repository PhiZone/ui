<script lang="ts">
  import Svelecte from 'svelecte';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
  import type { IFilterOrder, IFilterOrderItem, IFilterSelect } from '$lib/filters/types';
  import { t } from '$lib/translations/config';
  import type { RenderFunction } from 'svelecte/dist/Svelecte.svelte';

  export let filter: IFilterOrder;

  $: count = 0; // only for update component

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
  const renderer: RenderFunction = (item, _isSelection, _inputValue) => {
    const {
      id,
      label,
      value: { field, desc },
    } = item as IFilterOrderItem;
    const text: string = t.get(label);
    const type = desc ? 'desc' : 'asc';
    if (_isSelection) return `<span class='${type}'  data-item-id='${id}'>${text}</span>`;
    return text;
  };
</script>

<div use:clickBind class="join-item contents">
  {#key count}
    <Svelecte
      class="join-item flex-1 w-full input input-bordered min-h-[3rem] h-fit transition hover:input-secondary m-0 p-0 leading-5 md:leading-7 md:text-md"
      name={filter.param}
      dndzone={filter?.options?.multiple ? dndzone : undefined}
      highlightFirstItem={false}
      valueAsObject
      bind:value={filter.value}
      options={filter.items}
      {renderer}
      optionResolver={(opt) => opt}
      max={3}
      multiple
    />
  {/key}
</div>
