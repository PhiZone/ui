<script lang="ts">
  import type { TagDto } from '$lib/api/tag';

  export let tag: TagDto | string;
  export let full = false;
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
{:else if full}
  <a
    class="card w-56 h-[127.38px] bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
    href="/tags/{tag.id}"
  >
    <div class="card-body p-4 gap-0.5">
      <div class="flex flex-col mb-2">
        <h2 class="subtitle opacity-80 w-full truncate">
          #{tag.normalizedName}
        </h2>
        <h2 class="title-strong w-full truncate">
          {tag.name}
        </h2>
      </div>
      {#if tag.description}
        <p class="flex items-center">
          <span class="content ellipsis-2">
            {tag.description}
          </span>
        </p>
      {/if}
    </div>
  </a>
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

<style>
  .ellipsis-2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
