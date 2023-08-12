<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.song.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.songs')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.songs')}</h1>
  <SearchOptions
    params={searchParams}
    filters={[
      { value: 'id', name: $t('song.id'), options: 'number' },
      { value: 'name', name: $t('song.name'), options: 'text' },
      { value: 'composer', name: $t('song.composer'), options: 'text' },
      { value: 'illustrator', name: $t('song.illustrator'), options: 'text' },
      { value: 'uploader', name: $t('song.uploader'), options: 'number' },
      { value: 'duration', name: $t('song.duration'), options: 'range' },
      {
        value: 'original',
        name: $t('song.original'),
        options: [
          { value: '1', name: $t('common.yes') },
          { value: '0', name: $t('common.no') },
        ],
      },
    ]}
    orders={[
      { value: 'id', name: $t('song.id') },
      { value: 'name', name: $t('song.name') },
      { value: 'composer', name: $t('song.composer') },
      { value: 'illustrator', name: $t('song.illustrator') },
      { value: 'uploader', name: $t('song.uploader') },
      { value: 'duration', name: $t('song.duration') },
    ]}
  />
  {#if $query.isSuccess}
    {@const { data, total } = $query.data}
    {#if data.length > 0}
      <div class="result">
        {#each data as song}
          <div class="min-w-fit">
            <Song {song} />
          </div>
        {/each}
      </div>
      <Pagination {total} {page} {searchParams} />
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
    justify-items: center;
  }
</style>
