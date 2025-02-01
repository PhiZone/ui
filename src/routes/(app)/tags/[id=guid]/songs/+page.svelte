<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;
  $: ({ searchParams, page, id, api } = data);

  $: tag = createQuery(api.tag.info({ id }));
  $: query = createQuery(api.song.listTag({ id, ...searchParams }));
</script>

<svelte:head>
  <title>
    {$t('common.songs')} | {$t('common.tag')} - #{$tag.data?.data.normalizedName} | {$t(
      'common.site_name',
    )}
  </title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <h3 class="text-lg opacity-70">#{$tag.data?.data.normalizedName}</h3>
    <h1 class="text-4xl font-bold mb-6">{$t('common.songs')}</h1>
    {#if total && perPage && data.length > 0}
      <div class="result">
        {#each data as song}
          <div class="min-w-fit">
            <Song {song} />
          </div>
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
