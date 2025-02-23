<script lang="ts">
  import queryString, { type ParsedQuery } from 'query-string';

  import { range } from '$lib/utils';

  interface Props {
    studio?: boolean;
    total: number;
    perPage: number;
    page: number;
    pageName?: string;
    searchParams: ParsedQuery<string | number | boolean>;
  }
  let { studio = false, total, perPage, page, pageName = 'page', searchParams }: Props = $props();

  let totalPages = $derived(Math.ceil(total / perPage));
  let nearbyPagesStart = $derived(page <= 5 ? 1 : page - 3);
  let nearbyPagesEnd = $derived(page >= totalPages - 4 ? totalPages : page + 3);
  let nearbyPages = $derived(range(nearbyPagesStart, nearbyPagesEnd + 1));

  const getSearch = (page: number) => {
    return queryString.stringify({ ...searchParams, [pageName]: page });
  };
</script>

<div class="{studio ? 'pt-4 pb-16' : 'py-4'} min-w-fit flex justify-center">
  <div class="dropdown dropdown-hover dropdown-bottom w-full mt-3">
    <div class="join flex justify-center">
      <a
        href="?{getSearch(page - 1)}"
        class="btn join-item text-lg {page > 1 ? 'border-2 hover:btn-outline' : 'btn-disabled'}"
        aria-label="left"
      >
        <i class="fa-solid fa-arrow-left"></i>
      </a>
      {#if nearbyPagesStart !== 1}
        <a
          href="?{getSearch(1)}"
          class="btn join-item text-lg {page === 1 ? 'btn-disabled' : 'border-2 hover:btn-outline'}"
        >
          1
        </a>
        <span class="btn join-item text-lg btn-disabled pointer-events-none">...</span>
      {/if}
      {#each nearbyPages as p}
        <a
          href="?{getSearch(p)}"
          class="btn join-item text-lg {page === p ? 'btn-disabled' : 'border-2 hover:btn-outline'}"
        >
          {p}
        </a>
      {/each}
      {#if nearbyPagesEnd !== totalPages}
        <span class="btn btn-disabled join-item text-lg pointer-events-none">...</span>
        <a
          href="?{getSearch(totalPages)}"
          class="btn join-item text-lg {page === totalPages
            ? 'btn-disabled'
            : 'border-2 hover:btn-outline'}"
        >
          {totalPages}
        </a>
      {/if}
      <a
        href="?{getSearch(page + 1)}"
        class="btn join-item text-lg {page < totalPages
          ? 'border-2 hover:btn-outline'
          : 'btn-disabled'}"
        aria-label="right"
      >
        <i class="fa-solid fa-arrow-right"></i>
      </a>
    </div>
  </div>
</div>
