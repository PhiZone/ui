<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Notification from '$lib/components/Notification.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { onMount } from 'svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.notification.list(searchParams));

  onMount(() => {
    api.notification.readList(searchParams);
  });
</script>

<svelte:head>
  <title>{$t('notification.notifications')} | {$t('common.title')}</title>
</svelte:head>

<div class="bg-base-200 page">
  <div class="min-w-20">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-4xl font-bold">
        {$t('notification.notifications')}
        {searchParams.getRead ? `- ${$t('notification.read')}` : ''}
      </h1>
      {#if searchParams.getRead}
        <a href="/me/notifications" class="btn btn-primary btn-outline">
          {$t('notification.view_unread')}
        </a>
      {:else}
        <a href="/me/notifications?getRead=true" class="btn btn-primary btn-outline">
          {$t('notification.view_read')}
        </a>
      {/if}
    </div>
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

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
