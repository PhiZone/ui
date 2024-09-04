<script lang="ts">
    import type {IFilterInput} from "./types";

	export let filter:Omit<Omit<IFilterInput, 'label'>, 'type'>;
</script>

{#if filter?.options?.inputType == 'number'}
    <input
          type="number"
		  placeholder={filter.options.placeholder}
          bind:value={filter.value}
          min={filter.options.range?.[0]}
          max={filter.options.range?.[1]}
          class="input input-ghost input-bordered join-item flex-grow"
        />
{:else}
        <input
          type="text"
          placeholder={filter.options.placeholder}
          bind:value={filter.value}
          minlength={filter.options.range?.[0]}
          maxlength={filter.options.range?.[1]}
          class="input input-ghost input-bordered join-item flex-grow"
        />
{/if}
