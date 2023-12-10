<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Collection from '$lib/components/Collection.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.collection.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.collections')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.collections')}</h1>
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as collection}
          <div class="min-w-fit">
            <Collection {collection} fixedHeight />
          </div>
        {/each}
      </div>
      <Pagination {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  {/if}
</div>
