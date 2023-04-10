<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Chart from '$lib/components/Chart.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.chart.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.charts')} | {$t('common.title')}</title>
</svelte:head>
<!-- <input type="checkbox" id="list-options" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-100 max-h-[90vh] w-[50vw] max-w-[1800px]">
    <label
      for="list-options"
      class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2">✕</label
    >
    <h2 class="font-bold text-xl mb-4">{$t('common.list_options')}</h2>
    <label class="input-group my-2">
      <span class="w-1/6 min-w-[64px]">{$t('common.filter')}</span>
      <select
        bind:value={filter}
        class="select select-bordered w-1/3"
        on:change={async () => {
          if (filter === 'song') {
            const resp = await api.GET('/songs/?pagination=0', access_token);
            if (resp.ok) {
              songList = await resp.json();
            } else {
              console.log(await resp.json());
            }
          }
        }}
      >
        <option value="owner">{$t('chart.owner_id')}</option>
        <option value="song">{$t('song.song')}</option>
        <option value="chart_format">{$t('chart.format')}</option>
        <option value="ranked">{$t('chart.ranked')}</option>
        <option value="lowest_score">{$t('chart.lowest_score')}</option>
        <option value="highest_score">{$t('chart.highest_score')}</option>
        <option value="lowest_rating">{$t('chart.lowest_rating')}</option>
        <option value="highest_rating">{$t('chart.highest_rating')}</option>
        <option value="lowest_difficulty">{$t('chart.lowest_difficulty')}</option>
        <option value="highest_difficulty">{$t('chart.highest_difficulty')}</option>
        <option value="lowest_note_count">{$t('chart.lowest_note_count')}</option>
        <option value="highest_note_count">{$t('chart.highest_note_count')}</option>
      </select>
      {#if filter === 'song' || filter === 'ranked' || filter === 'chart_format'}
        <select bind:value={filterParam} class="select select-bordered w-1/2">
          {#if filter === 'song' && songList}
            {#each songList as song}
              {#if typeof song.song === 'object'}
                <option value={`${song.id}`}>{song.composer} - {song.name} ({song.edition})</option>
              {/if}
            {/each}
          {:else if filter === 'ranked'}
            <option value="1">{$t('common.true')}</option>
            <option value="0">{$t('common.false')}</option>
          {:else if filter === 'chart_format'}
            <option value="0">{$t('chart.formats.0')}</option>
            <option value="1">{$t('chart.formats.1')}</option>
          {/if}
        </select>
      {:else}
        <input bind:value={filterParam} class="input input-bordered w-1/2" />
      {/if}
    </label>
    <label class="input-group my-2">
      <span class="w-1/6 min-w-[64px]">{$t('common.order')}</span>
      <select bind:value={reverse} class="select select-bordered w-1/3">
        <option value={false}>{$t('common.order_forward')}</option>
        <option value={true}>{$t('common.order_backward')}</option>
      </select>
      <select bind:value={order} class="select select-bordered w-1/2">
        <option value="id">{$t('chart.id')}</option>
        <option value="song">{$t('chart.song')}</option>
        <option value="level_type">{$t('chart.level_type')}</option>
        <option value="level">{$t('chart.level')}</option>
        <option value="difficulty">{$t('chart.difficulty')}</option>
        <option value="notes">{$t('chart.notes')}</option>
        <option value="score">{$t('chart.score')}</option>
        <option value="rating">{$t('chart.rating')}</option>
        <option value="r_arrangement">{$t('chart.r_arrangement')}</option>
        <option value="r_feel">{$t('chart.r_feel')}</option>
        <option value="r_vfx">{$t('chart.r_vfx')}</option>
        <option value="r_innovativeness">{$t('chart.r_innovativeness')}</option>
        <option value="r_concord">{$t('chart.r_concord')}</option>
        <option value="r_impression">{$t('chart.r_impression')}</option>
        <option value="owner">{$t('chart.owner')}</option>
      </select>
    </label>
    <div class="modal-action">
      <button
        class={`btn ${
          (filter !== null && filterParam !== null) || order !== null
            ? 'btn-primary btn-outline'
            : 'btn-disabled'
        }`}
        on:click={() => {
          window.location.href =
            filter &&
            filterParam &&
            order &&
            $page.url.search.includes(filter) &&
            $page.url.search.includes('order')
              ? `${$page.url.pathname}${$page.url.search
                  .replace(new RegExp(`${filter}=[^&]*`, 'g'), `${filter}=${filterParam}`)
                  .replace(/order=[^&]*/g, `order=${reverse ? '-' : ''}${order}`)}`
              : filter && filterParam && $page.url.search.includes(filter)
              ? `${$page.url.pathname}${$page.url.search.replace(
                  new RegExp(`${filter}=[^&]*`, 'g'),
                  `${filter}=${filterParam}`
                )}`
              : order && $page.url.search.includes('order')
              ? `${$page.url.pathname}${$page.url.search.replace(
                  /order=[^&]*/g,
                  `order=${reverse ? '-' : ''}${order}`
                )}`
              : `${$page.url.pathname}${$page.url.search}${$page.url.search ? '&' : '?'}${
                  filter !== null && filterParam !== null
                    ? `${filter}=${filterParam}${order !== null ? '&' : ''}`
                    : ''
                }${order !== null ? `order=${reverse ? '-' : ''}${order}` : ''}`;
        }}>{$t('common.continue')}</button
      >
    </div>
  </div>
</div> -->

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.charts')}</h1>
  <SearchOptions
    params={searchParams}
    filters={[
      { value: 'id', name: 'id', options: 'number' },
      { value: 'song', name: 'song id', options: 'number' },
      { value: 'owner', name: 'owner id', options: 'number' },
      {
        value: 'level',
        name: 'Level',
        options: [
          { value: 'EZ', name: 'EZ' },
          { value: 'HD', name: 'HD' },
          { value: 'IN', name: 'IN' },
          { value: 'AT', name: 'AT' },
        ],
      },
      { value: 'charter', name: 'charter', options: 'text' },
      { value: 'description', name: 'description', options: 'text' },
      {
        value: 'ranked',
        name: 'ranked',
        options: [
          { value: '1', name: 'yes' },
          { value: '0', name: 'no' },
        ],
      },
      { value: 'difficulty', name: 'difficulty', options: 'range' },
      { value: 'note_count', name: 'note_count', options: 'range' },
      { value: 'score', name: 'score', options: 'range' },
      { value: 'rating', name: 'rating', options: 'range' },
    ]}
    orders={[
      { value: 'id', name: 'id' },
      { value: 'song', name: 'song' },
      { value: 'owner', name: 'owner' },
      { value: 'charter', name: 'charter' },
      { value: 'level', name: 'level' },
      { value: 'difficulty', name: 'difficulty' },
      { value: 'note_count', name: 'note_count' },
      { value: 'score', name: 'score' },
    ]}
  />
  {#if $query.isSuccess}
    {@const { results, count } = $query.data}
    {#if results.length > 0}
      <div class="result">
        {#each results as chart}
          <Chart {chart} />
        {/each}
      </div>
      <Pagination {count} {page} {searchParams} />
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
