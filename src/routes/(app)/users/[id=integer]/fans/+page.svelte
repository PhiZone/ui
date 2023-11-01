<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import User from '$lib/components/User.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, id, page, api } = data);

  $: query = createQuery(api.user.followers({ id, page }));
</script>

<svelte:head>
  <title>{$t('user.user')} - {$t('user.fans')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('user.fans')}</h1>
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
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
  {/if}
</div>
