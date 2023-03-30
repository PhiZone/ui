<script lang="ts">
  import { t } from '$lib/translations/config';
  import { onMount } from 'svelte';
  import { Status } from '$lib/constants';
  import Pagination from '$lib/components/pagination.svelte';
  import type { Collaboration } from '$lib/models';
  import { afterNavigate, beforeNavigate, goto, preloadData } from '$app/navigation';
  import { page } from '$app/stores';
  import CollaborationCard from '$lib/components/collaboration.svelte';
  export let data: import('./$types').PageData;
  $: ({ status, content, error, user, access_token } = data);

  let pageIndex = 1,
    collaborationCount: number,
    pageStatus = Status.RETRIEVING,
    collaborations: Collaboration[],
    previousCollaborations: string,
    nextCollaborations: string;

  const callback = () => {
    pageStatus = status;
    if (status === Status.OK) {
      collaborations = content.results;
      collaborationCount = content.count;
      previousCollaborations = content.previous;
      nextCollaborations = content.next;
    } else {
      console.log('status:', status);
      console.log('error:', error);
    }
  };

  beforeNavigate(() => {
    pageStatus = Status.RETRIEVING;
  });
  onMount(callback);
  afterNavigate(callback);
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.collaborations')} - {$page.url.searchParams.get('sent')
      ? $t('studio.request.sent')
      : $t('studio.request.received')} | {$t('common.title')}
  </title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-4xl font-bold">
          {$t('studio.collaborations')} - {$page.url.searchParams.get('sent')
            ? $t('studio.request.sent')
            : $t('studio.request.received')}
        </h1>
        {#if $page.url.searchParams.get('sent')}
          <button
            class="btn btn-primary btn-outline"
            on:click={() => {
              goto('/studio/collaborations/');
            }}
            on:pointerenter={() => {
              preloadData('/studio/collaborations/');
            }}>{$t('studio.request.received')}</button
          >
        {:else}
          <button
            class="btn btn-primary btn-outline"
            on:click={() => {
              goto('/studio/collaborations/?sent=1');
            }}
            on:pointerenter={() => {
              preloadData('/studio/collaborations/?sent=1');
            }}>{$t('studio.request.sent')}</button
          >
        {/if}
      </div>
      <div class="min-w-fit form-control gap-4">
        {#if pageStatus === Status.OK && collaborations}
          {#if collaborations.length > 0}
            {#each collaborations as collaboration}
              <CollaborationCard {collaboration} token={access_token} {user} />
            {/each}
            <Pagination
              bind:previous={previousCollaborations}
              bind:next={nextCollaborations}
              bind:results={collaborations}
              bind:count={collaborationCount}
              bind:pageIndex
              bind:status={pageStatus}
              token={access_token}
              {user}
            />
          {:else}
            <p class="py-3 text-center">{$t('common.empty')}</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>
