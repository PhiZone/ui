<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Collaboration from '$lib/components/Collaboration.svelte';
  import Pagination from '$lib/components/Pagination.svelte';

  export let data;
  $: ({ searchParams, page, user, api } = data);

  $: query = createQuery(api.collaboration.list(searchParams));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.collaborations')}
    {!!searchParams.rangeInviterId
      ? `- ${$t('studio.request.sent')}`
      : !!searchParams.rangeInviteeId
      ? `- ${$t('studio.request.received')}`
      : ''} | {$t('common.title')}
  </title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold">
          {$t('studio.collaborations')}
          {!!searchParams.rangeInviterId
            ? `- ${$t('studio.request.sent')}`
            : !!searchParams.rangeInviteeId
            ? `- ${$t('studio.request.received')}`
            : ''}
        </h1>
        <div class="join">
          <a
            href="/studio/collaborations/?rangeInviteeId={user?.id}"
            class="btn btn-primary btn-outline join-item"
          >
            {$t('studio.request.received')}
          </a>
          <a
            href="/studio/collaborations/?rangeInviterId={user?.id}"
            class="btn btn-primary btn-outline join-item"
          >
            {$t('studio.request.sent')}
          </a>
        </div>
      </div>
      <div class="min-w-fit form-control gap-4">
        {#if $query.isSuccess}
          {@const { total, perPage, data } = $query.data}
          {#if total && perPage && data.length > 0}
            {#each data as collaboration}
              <Collaboration {collaboration} />
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
