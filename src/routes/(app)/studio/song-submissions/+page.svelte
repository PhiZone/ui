<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Pagination from '$lib/components/Pagination.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.song.submission.list(searchParams));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.song_submission')} | {$t('common.title')}
  </title>
</svelte:head>

<div class="bg-base-300 min-h-screen">
  <div class="pt-32 pb-4 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex gap-2 justify-between items-center mb-6">
        <h1 class="text-4xl font-bold content">
          {$t('studio.song_submissions')}
        </h1>
        <a href="/studio/song-submissions/new" class="btn btn-accent text-lg btn-xl btn-outline">
          {$t('studio.upload_song')}
        </a>
      </div>
      {#if $query.isSuccess}
        {@const { total, perPage, data } = $query.data}
        {#if total && perPage && data && data.length > 0}
          <div class="result">
            {#each data as song}
              <SongSubmission {song} />
            {/each}
          </div>
          <Pagination {total} {perPage} {page} {searchParams} />
        {:else}
          <p class="py-3 text-center">{$t('common.empty')}</p>
        {/if}
      {/if}
    </div>
  </div>
</div>
