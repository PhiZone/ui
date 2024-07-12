<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Record from '$lib/components/Record.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.record.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.records')} | {$t('common.title')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <h1 class="text-4xl font-bold mb-6">{$t('common.records')}</h1>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as record}
          <Record {record} />
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
