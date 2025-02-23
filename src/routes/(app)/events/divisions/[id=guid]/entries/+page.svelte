<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import queryString from 'query-string';

  import Chart from '$lib/components/Chart.svelte';
  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Record from '$lib/components/Record.svelte';
  import Song from '$lib/components/Song.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { id, searchParams, page, api } = $derived(data);

  let divisionQuery = $derived(createQuery(api.event.division.info({ id })));
  let eventQuery = $derived(
    createQuery(
      api.event.info(
        { id: $divisionQuery.data?.data.eventId ?? '' },
        { enabled: $divisionQuery.isSuccess },
      ),
    ),
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
  let songEntries = $derived(
    createQuery(
      api.event.division.listSongEntries(
        {
          id,
          ...queryString.parse($divisionQuery.data?.data.suggestedEntrySearch ?? ''),
          ...searchParams,
        },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 0 },
      ),
    ),
  );
  let chartEntries = $derived(
    createQuery(
      api.event.division.listChartEntries(
        {
          id,
          ...queryString.parse($divisionQuery.data?.data.suggestedEntrySearch ?? ''),
          ...searchParams,
        },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 1 },
      ),
    ),
  );
  let recordEntries = $derived(
    createQuery(
      api.event.division.listRecordEntries(
        {
          id,
          ...queryString.parse($divisionQuery.data?.data.suggestedEntrySearch ?? ''),
          ...searchParams,
        },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 2 },
      ),
    ),
  );
</script>

<svelte:head>
  <title>
    {$t('event.division.entries')} | {$t('event.event')} - {$eventQuery.data?.data.title} ({$divisionQuery
      .data?.data.title}) | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $divisionQuery.isSuccess && $eventQuery.isSuccess && (($divisionQuery.data.data.type == 0 && $songEntries.isSuccess) || ($divisionQuery.data.data.type == 1 && $chartEntries.isSuccess) || ($divisionQuery.data.data.type == 2 && $recordEntries.isSuccess))}
  {@const division = $divisionQuery.data.data}
  {@const event = $eventQuery.data.data}
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
{:else if $divisionQuery.isError}
  <Error error={$divisionQuery.error} />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
