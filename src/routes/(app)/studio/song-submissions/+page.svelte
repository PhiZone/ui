<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Paginator from '$lib/components/Paginatior.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import Error from '$lib/components/Error.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.song.submission.list(searchParams));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.song_submission')} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="bg-base-300 min-h-screen">
    <div class="pt-32 pb-4 flex justify-center">
      <div class="w-3/4 max-w-7xl min-w-20">
        <div class="flex gap-2 justify-between items-center mb-6">
          <h1 class="text-4xl font-bold content">
            {$t('studio.song_submissions')}
          </h1>
          <SearchBar name="studio.song_submissions" {searchParams} />
          <a
            href="/studio/song-submissions/new"
            class="btn text-lg btn-xl border-2 btn-outline normal-border"
          >
            {$t('studio.upload_song')}
          </a>
        </div>
        {#if total && perPage && data && data.length > 0}
          <div class="result">
            {#each data as song}
              <SongSubmission {song} />
            {/each}
          </div>
          <Paginator {total} {perPage} {page} {searchParams} />
        {:else}
          <p class="py-3 text-center">{$t('common.empty')}</p>
        {/if}
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
