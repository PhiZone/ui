<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Chapter from '$lib/components/Chapter.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.chapter.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.chapters')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.chapters')}</h1>
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as chapter}
          <div class="min-w-fit">
            <Chapter {chapter} fixedHeight />
          </div>
        {/each}
      </div>
      <Pagination {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  {/if}
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .result {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 1.5rem;
    justify-items: center;
  }
</style>
