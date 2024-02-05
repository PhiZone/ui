<script lang="ts">
  import type { TagDto } from '$lib/api/tag';

  export let tag: TagDto | string;
  export let removeFunction: (() => void) | undefined = undefined;
  export let removeHover = false;
</script>

{#if typeof tag === 'string'}
  <span
    class="badge badge-neutral {removeHover
      ? 'hover:badge-outline'
      : ''} border-2 inline-flex gap-1"
  >
    <p>{tag}</p>
    {#if removeFunction}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="cursor-pointer"
        on:click={removeFunction}
        on:keyup
        on:mouseenter={() => {
          removeHover = true;
        }}
        on:mouseleave={() => {
          removeHover = false;
        }}
      >
        ✕
      </span>
    {/if}
  </span>
{:else}
  <a
    href="/tags/{tag.id}"
    class="badge badge-neutral transition {tag.description
      ? 'hover:badge-accent'
      : 'hover:badge-secondary'} {removeHover
      ? 'hover:badge-outline'
      : ''} border-2 inline-flex gap-1"
  >
    <p>{tag.name}</p>
    {#if removeFunction}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        class="cursor-pointer"
        on:click={removeFunction}
        on:keyup
        on:mouseenter={() => {
          removeHover = true;
        }}
        on:mouseleave={() => {
          removeHover = false;
        }}
      >
        ✕
      </span>
    {/if}
  </a>
{/if}
