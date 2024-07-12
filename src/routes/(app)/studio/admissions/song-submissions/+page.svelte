<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Admission from '$lib/components/SongSubmissionAdmission.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;
  $: ({ searchParams, page, user, api } = data);

  $: query = createQuery(api.admission.listSongSubmission(searchParams));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.song_submission_admissions')}
    {searchParams.rangeRequesterId
      ? `- ${$t('studio.request.sent')}`
      : searchParams.rangeRequesteeId
        ? `- ${$t('studio.request.received')}`
        : ''} | {$t('common.title')}
  </title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="bg-base-300 min-h-screen">
    <div class="pt-32 pb-4 flex justify-center">
      <div class="w-3/4 max-w-7xl min-w-20">
        <div class="flex gap-2 justify-between items-center mb-6">
          <h1 class="text-4xl font-bold">
            {$t('studio.song_submission_admissions')}
            {searchParams.rangeRequesterId
              ? `- ${$t('studio.request.sent')}`
              : searchParams.rangeRequesteeId
                ? `- ${$t('studio.request.received')}`
                : ''}
          </h1>
          <div class="join join-vertical md:join-horizontal min-w-fit max-w-fit">
            <a
              href="/studio/admissions/song-submissions?rangeRequesteeId={user?.id}"
              class="btn btn-outline border-2 normal-border join-item min-w-fit"
            >
              {$t('studio.request.received')}
            </a>
            <a
              href="/studio/admissions/song-submissions?rangeRequesterId={user?.id}"
              class="btn btn-outline border-2 normal-border join-item min-w-fit"
            >
              {$t('studio.request.sent')}
            </a>
          </div>
        </div>
        <div class="min-w-fit form-control gap-4">
          {#if total && perPage && data.length > 0}
            {#each data as admission}
              <Admission {admission} />
            {/each}
            <Paginator {total} {perPage} {page} {searchParams} />
          {:else}
            <p class="py-3 text-center">{$t('common.empty')}</p>
          {/if}
        </div>
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio" />
{:else}
  <div class="min-h-screen skeleton" />
{/if}
