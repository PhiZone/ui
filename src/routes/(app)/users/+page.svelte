<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import User from '$lib/components/User.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.user.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.users')} | {$t('common.title')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <h1 class="text-4xl font-bold mb-6">{$t('common.users')}</h1>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as user}
          <div class="w-80">
            <User id={user.id} initUser={user} fixedHeight />
          </div>
        {/each}
      </div>
      <Pagination {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton" />
{/if}
