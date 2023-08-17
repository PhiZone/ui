<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Notification from '$lib/components/notification.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.notification.list(searchParams));
</script>

<svelte:head>
  <title>{$t('notification.notifications')} | {$t('common.title')}</title>
</svelte:head>

<div class="bg-base-200 page">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">
        {$t('notification.notifications')}
      </h1>
      <div class="py-4 min-w-fit">
        {#if $query.isSuccess}
          {@const { total, perPage, data } = $query.data}
          {#if total && perPage && data && data.length > 0}
            {#each data as notification}
              <Notification {notification} />
            {/each}
            <Pagination {total} {perPage} {page} {searchParams} />
          {:else}
            <p class="py-3 text-center">{$t('common.empty')}</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
