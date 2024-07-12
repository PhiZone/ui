<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Collection from '$lib/components/Collection.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.collection.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.collections')} | {$t('common.title')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <div class="flex items-center flex-wrap justify-between gap-2 mb-6">
      <h1 class="text-4xl font-bold">{$t('common.collections')}</h1>
      <SearchBar name="common.collections" {searchParams} />
    </div>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as collection}
          <div class="min-w-fit">
            <Collection {collection} fixedHeight />
          </div>
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton" />
{/if}
