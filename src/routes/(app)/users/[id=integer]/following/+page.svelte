<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import User from '$lib/components/User.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, id, page, api } = data);

  $: query = createQuery(api.user.listFollowees({ id, page }));
</script>

<svelte:head>
  <title>{$t('user.user')} - {$t('user.following')} | {$t('common.title')}</title>
</svelte:head>

<div class="pt-32 bg-base-200 page form-control justify-center">
  <h1 class="px-32 text-4xl font-bold mb-6">{$t('user.following')}</h1>
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
    {#if total && perPage && data && data.length > 0}
      <div class="px-32 result">
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

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .result {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 1.5rem;
  }
</style>
