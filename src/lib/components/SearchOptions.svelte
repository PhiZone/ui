<script lang="ts">
  import type { ParsedQuery } from 'query-string';

  interface ValueName {
    value: string;
    name: string;
  }

  type Option = ValueName;

  interface Filter extends ValueName {
    options: 'text' | 'number' | 'range' | Option[];
  }

  type Order = ValueName;

  export let filters: Filter[];
  export let orders: Order[];

  export let params: ParsedQuery<string | number | boolean>;

  let open = false;
</script>

<div class="collapse collapse-arrow bg-base-100 m-4 rounded-box w-full self-center">
  <input type="checkbox" bind:checked={open} />
  <div class="collapse-title texl-xl">Search Options</div>
  <div class="collapse-content">
    <form class="form-control items-stretch w-full">
      {#each filters as filter}
        <label class="label join text-sm md:text-md cursor-pointer">
          <span class="label-text btn no-animation join-item whitespace-nowrap">{filter.name}</span>
          {#if filter.options === 'text' || filter.options === 'number'}
            <input
              type={filter.options}
              name={filter.value}
              placeholder={filter.name}
              value={params?.[filter.value] ?? ''}
              class="input input-ghost input-bordered input-sm md:input-md join-item flex-grow w-0"
            />
          {:else if filter.options === 'range'}
            <input
              type="number"
              name="lowest_{filter.value}"
              placeholder="lowest {filter.name}"
              value={params?.[`lowest_${filter.value}`] ?? ''}
              class="input input-ghost input-bordered input-sm md:input-md join-item flex-grow w-0"
            />
            <input
              type="number"
              name="highest_{filter.value}"
              placeholder="highest {filter.name}"
              value={params?.[`highest_${filter.value}`] ?? ''}
              class="input input-ghost input-bordered input-sm md:input-md join-item flex-grow w-0"
            />
          {:else}
            <select
              class="select select-ghost select-bordered select-sm md:select-md join-item flex-grow w-0"
              name={filter.value}
              value={params?.[filter.value] ?? ''}
            >
              <option />
              {#each filter.options as option}
                <option value={option.value}>{option.name}</option>
              {/each}
            </select>
          {/if}
        </label>
      {/each}
      <label class="label join text-sm md:text-md cursor-pointer">
        <span class="label-text btn no-animation join-item whitespace-nowrap">order</span>
        <select
          class="select select-ghost select-bordered select-sm md:select-md join-item flex-grow w-0"
          name="order_by"
          value={params?.order_by || orders[0].value}
        >
          {#each orders as order}
            <option value={order.value}>{order.name}</option>
          {/each}
        </select>
        <select
          class="select select-ghost select-bordered select-sm md:select-md join-item flex-grow w-0"
          name="order"
          value={params?.order || 'asc'}
        >
          <option value="asc">ascending</option>
          <option value="desc">descending</option>
        </select>
      </label>
      <button type="submit" class="btn btn-secondary" on:click={() => (open = false)}>
        search
      </button>
    </form>
  </div>
</div>
