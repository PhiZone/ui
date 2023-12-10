<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Notification from '$lib/components/Notification.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import { invalidateAll } from '$app/navigation';

  export let data;
  $: ({ searchParams, page, api } = data);

  let disabled = false;

  $: query = createQuery(api.notification.list(searchParams));
</script>

<svelte:head>
  <title>{$t('notification.notifications')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <div class="min-w-20">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-4xl font-bold">
        {$t('notification.notifications')}
        {searchParams.getRead ? `- ${$t('notification.read_adj')}` : ''}
      </h1>
      {#if searchParams.getRead}
        <a href="/me/notifications" class="btn btn-outline border-2 border-gray-700">
          {$t('notification.view_unread')}
        </a>
      {:else}
        <div class="join">
          <button
            class="join-item btn border-2 border-gray-700 {disabled
              ? 'btn-disabled'
              : 'btn-outline'}"
            on:click={async () => {
              if (!$query.isSuccess || $query.data.data.length === 0) return;
              disabled = true;
              const resp = await api.notification.readList(searchParams);
              if (resp.ok) {
                await invalidateAll();
              }
              disabled = false;
            }}
          >
            {$t('notification.read_page')}
          </button>
          <a
            href="/me/notifications?getRead=true"
            class="join-item btn btn-outline border-2 border-gray-700"
          >
            {$t('notification.view_read')}
          </a>
        </div>
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
