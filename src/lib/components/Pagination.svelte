<script lang="ts">
  import queryString, { type ParsedQuery } from 'query-string';
  import { PAGINATION_PER_PAGE } from '$lib/constants';
  import { range } from '$lib/utils';

  export let studio = false;
  export let count: number;
  export let page: number;
  export let pageName = 'page';
  export let searchParams: ParsedQuery<string | number | boolean>;

  $: total = Math.ceil(count / PAGINATION_PER_PAGE);
  // let pages = range(1, total + 1);
  $: nearbyPagesStart = page <= 3 ? 1 : page - 1;
  $: nearbyPagesEnd = page >= total - 2 ? total : page + 1;
  $: nearbyPages = range(nearbyPagesStart, nearbyPagesEnd + 1);

  // let preloaded: number | null = null,
  //   total = Math.ceil(count / PAGINATION_PER_PAGE),
  //   resp: { json: () => any; ok: any },
  //   nearbyPages = [
  //     ...Array(pageIndex > 3 ? Math.min(pageIndex + 4, total + 1) : Math.min(total + 1, 8)).keys(),
  //   ].slice(Math.max(1, pageIndex <= total - 3 ? pageIndex - 3 : total - 6)),
  //   allPages = [...Array(total + 1).keys()].slice(1);

  // const preload = async (url: string, page: number) => {
  //   resp = await api.GET(getPath(url), token, user);
  //   preloaded = page;
  // };

  // const get = async (url: string, page: number) => {
  //   status = Status.RETRIEVING;
  //   results = null;
  //   if (preloaded === null || preloaded != page) {
  //     resp = await api.GET(getPath(url), token, user);
  //   }
  //   const json = await resp.json();
  //   if (!resp.ok) {
  //     status = Status.ERROR;
  //     console.log(json);
  //   }
  //   count = json.count;
  //   previous = json.previous;
  //   next = json.next;
  //   results = json.results;
  //   total = Math.ceil(count / PAGINATION_PER_PAGE);
  //   preloaded = null;
  //   setTimeout(() => {
  //     status = Status.OK;
  //   }, 1);
  // };
  const getSearch = (page: number) => {
    return queryString.stringify({ ...searchParams, [pageName]: page });
  };
</script>

<!-- <input type="checkbox" id="pagination" class="modal-toggle" />
<div class="modal">
  <div
    class="modal-box bg-base-100 max-h-[90vh] {$_page.url.pathname.startsWith('/studio')
      ? 'w-[40vw]'
      : 'w-[70vw]'} max-w-[1800px]"
  >
    <label
      for="pagination"
      class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2">✕</label
    >
    <h2 class="font-bold text-xl mb-4">{$t('common.jump_to')}</h2>
    <div class="page-btn-grid">
      {#each pages as p}
        <label
          for="pagination"
          class="btn btn-sm btn-circle {page == p ? 'btn-disabled' : 'btn-outline'}"
          on:click={async () => {
            let url = next ? next : previous ? previous : null;
            if (url) {
              await get(url.replace(/page=\d+/, `page=${p}`), p);
              pageIndex = p;
              results = results;
              previous = previous;
              next = next;
            }
          }}
          on:pointerenter={() => {
            if (total > 20) {
              return;
            }
            let url = next ? next : previous ? previous : null;
            if (url) {
              preload(url.replace(/page=\d+/, `page=${p}`), p);
            }
          }}
          on:keyup>{p}</label
        >
      {/each}
    </div>
  </div>
</div> -->
<div class="{studio ? 'pt-4 pb-16' : 'py-4'} min-w-fit flex justify-center">
  <div class="dropdown dropdown-hover dropdown-bottom w-full mt-3">
    <div class="btn-group flex justify-center">
      <a
        href="?{getSearch(page - 1)}"
        class="btn btn-primary text-4xl {page > 1
          ? 'btn-primary btn-outline'
          : 'btn-ghost btn-disabled'}"
      >
        «
      </a>
      {#if nearbyPagesStart !== 1}
        <a
          href="?{getSearch(1)}"
          class="btn btn-primary text-lg {page === 1 ? 'btn-active btn-disabled' : 'btn-outline'}"
        >
          1
        </a>
        <span class="btn text-lg btn-disabled pointer-events-none">...</span>
      {/if}
      {#each nearbyPages as p}
        <a
          href="?{getSearch(p)}"
          class="btn btn-primary text-lg {page === p ? 'btn-active btn-disabled' : 'btn-outline'}"
        >
          {p}
        </a>
      {/each}
      {#if nearbyPagesEnd !== total}
        <span class="btn text-lg btn-disabled pointer-events-none">...</span>
        <a
          href="?{getSearch(total)}"
          class="btn btn-primary text-lg {page === total
            ? 'btn-active btn-disabled'
            : 'btn-outline'}"
        >
          {total}
        </a>
      {/if}
      <a
        href="?{getSearch(page + 1)}"
        class="btn btn-primary text-4xl {page < total ? 'btn-outline' : 'btn-ghost btn-disabled'}"
      >
        »
      </a>
    </div>
  </div>
</div>

<style>
  /* .page-btn-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(25px, 1fr));
    grid-gap: 1rem;
  } */
</style>
