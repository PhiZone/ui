<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Error from '$lib/components/Error.svelte';
  import Event from '$lib/components/Event.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { searchParams, page, api } = $derived(data);

  let query = $derived(createQuery(api.event.list(searchParams)));
</script>

<svelte:head>
  <title>{$t('common.events')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <div class="flex items-center flex-wrap justify-between gap-2 mb-6">
      <h1 class="text-4xl font-bold">{$t('common.events')}</h1>
      <SearchBar name="common.events" {searchParams} />
    </div>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as event}
          <div class="min-w-fit">
            <Event {event} />
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
  <div class="min-h-page skeleton"></div>
{/if}
