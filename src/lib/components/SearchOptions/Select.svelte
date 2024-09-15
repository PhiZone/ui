<script lang="ts">
  import Svelecte from 'svelecte';
  import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
  import type { IFilterSelect } from '$lib/filters/types';
  import { t } from '$lib/translations/config';

  export let filter: IFilterSelect;

  overrideItemIdKeyNameBeforeInitialisingDndZones('value');

</script>

<Svelecte
  class="join-item flex-1 w-full input input-bordered min-h-[3rem] h-fit transition hover:input-secondary m-0 p-0 leading-5 md:leading-7 md:text-md"
  bind:value={filter.value}
  options={filter.items}
  optionResolver={(opt) => {
    let newOpt = [];
    opt.forEach((o) => newOpt.push({ ...o, label: $t(o.label), rawLabel: o.label })); // translate label
    return newOpt;
  }}
  dndzone={filter?.options?.multiple ? dndzone : undefined}
  highlightFirstItem={false}
  {...filter.options}
  on:mousedown={(e)=>{
    //console.log(filter.value,(e.target as HTMLDivElement).textContent)

  }}
/>
