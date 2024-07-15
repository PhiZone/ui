<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Record from '$lib/components/Record.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;
  $: ({ id, searchParams, page, api } = data);

  $: division = createQuery(api.event.division.info({ id }));
  $: event = createQuery(
    api.event.info({ id: $division.data?.data.eventId ?? '' }, { enabled: $division.isSuccess }),
  );
  // $: songPrompts = createQuery(
  //   api.event.division.listSongPrompts(
  //     { id },
  //     { enabled: $division.isSuccess && $division.data.data.type == 1 && index == 0 },
  //   ),
  // );
  // $: chartPrompts = createQuery(
  //   api.event.division.listChartPrompts(
  //     { id },
  //     { enabled: $division.isSuccess && $division.data.data.type == 2 && index == 0 },
  //   ),
  // );
  $: songEntries = createQuery(
    api.event.division.listSongEntries(
      { id, search: $division.data?.data.suggestedEntrySearch },
      { enabled: $division.isSuccess && $division.data.data.type == 0 },
    ),
  );
  $: chartEntries = createQuery(
    api.event.division.listChartEntries(
      { id, search: $division.data?.data.suggestedEntrySearch },
      { enabled: $division.isSuccess && $division.data.data.type == 1 },
    ),
  );
  $: recordEntries = createQuery(
    api.event.division.listRecordEntries(
      { id, search: $division.data?.data.suggestedEntrySearch },
      { enabled: $division.isSuccess && $division.data.data.type == 2 },
    ),
  );
</script>

<svelte:head>
  <title>
    {$t('event.division.entries')} | {$t('event.event')} - {$event.data?.data.title} ({$division
      .data?.data.title}) | {$t('common.title')}
  </title>
</svelte:head>

{#if $division.isSuccess && $event.isSuccess && (($division.data.data.type == 0 && $songEntries.isSuccess) || ($division.data.data.type == 1 && $chartEntries.isSuccess) || ($division.data.data.type == 2 && $recordEntries.isSuccess))}
  {@const division = $division.data.data}
  {@const event = $event.data.data}
  <div class="page">
    <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
      <a class="transition hover:text-accent" href="/events/{event.id}">{event.title}</a>
      /
      <a class="transition hover:text-accent" href="/events/divisions/{division.id}">
        {division.title}
      </a>
    </h1>
    <h1 class="text-4xl font-bold mt-3 mb-6">{$t('event.division.entries')}</h1>
    {#if division.type == 0 && $songEntries.isSuccess}
      {@const { total, perPage, data } = $songEntries.data}
      {#if total && perPage && data && data.length > 0}
        <div class="result">
          {#each data as song}
            <Song {song} />
          {/each}
        </div>
        <Paginator {total} {perPage} {page} {searchParams} />
      {:else}
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {/if}
    {#if division.type == 1 && $chartEntries.isSuccess}
      {@const { total, perPage, data } = $chartEntries.data}
      {#if total && perPage && data && data.length > 0}
        <div class="result">
          {#each data as chart}
            <Chart {chart} />
          {/each}
        </div>
        <Paginator {total} {perPage} {page} {searchParams} />
      {:else}
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {/if}
    {#if division.type == 2 && $recordEntries.isSuccess}
      {@const { total, perPage, data } = $recordEntries.data}
      {#if total && perPage && data && data.length > 0}
        <div class="result">
          {#each data as record}
            <Record {record} />
          {/each}
        </div>
        <Paginator {total} {perPage} {page} {searchParams} />
      {:else}
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {/if}
  </div>
{:else if $division.isError}
  <Error error={$division.error} />
{:else}
  <div class="min-h-page skeleton" />
{/if}
