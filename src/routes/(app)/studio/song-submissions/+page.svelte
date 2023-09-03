<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Pagination from '$lib/components/Pagination.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.song.submission.list(searchParams));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.song_submission')} | {$t('common.title')}
  </title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 pb-4 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">
          {$t('studio.song_submissions')}
        </h1>
        <div class="flex justify-between gap-3">
          <a href="/studio/song-submissions/new" class="btn btn-accent text-lg btn-xl btn-outline">
            {$t('studio.upload_song')}
          </a>
        </div>
      </div>
      <SearchOptions
        params={searchParams}
        filters={[
          {
            value: 'status',
            name: $t('studio.submission.status'),
            options: [
              { value: '0', name: $t('studio.submission.statuses.0') },
              { value: '1', name: $t('studio.submission.statuses.1') },
              { value: '2', name: $t('studio.submission.statuses.2') },
            ],
          },
          { value: 'uploader', name: $t('studio.submission.uploader_id'), options: 'number' },
          { value: 'reviewer', name: $t('studio.submission.reviewer_id'), options: 'number' },
          { value: 'chapter', name: $t('song.chapter'), options: 'number' },
        ]}
        orders={[
          { value: 'id', name: $t('song.id') },
          { value: 'name', name: $t('song.name') },
          { value: 'composer', name: $t('song.composer') },
          { value: 'illustrator', name: $t('song.illustrator') },
          { value: 'uploader', name: $t('studio.submission.uploader') },
          { value: 'reviewer', name: $t('studio.submission.reviewer') },
        ]}
      />
      <div class="min-w-fit form-control gap-4">
        {#if $query.isSuccess}
          {@const { total, perPage, data } = $query.data}
          {#if total && perPage && data && data.length > 0}
            {#each data as submission}
              <SongSubmission {submission} />
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
