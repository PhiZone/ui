<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Record from '$lib/components/Record.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.record.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.records')} | {$t('common.title')}</title>
</svelte:head>

<!-- <input type="checkbox" id="list-options" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-100 max-h-[90vh] w-[50vw] max-w-[1800px]">
    <label
      for="list-options"
      class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <h2 class="font-bold text-xl mb-4">{$t('common.list_options')}</h2>
    <label class="input-group my-2">
      <span class="w-1/6 min-w-[64px]">{$t('common.filter')}</span>
      <select
        bind:value={filter}
        class="select select-bordered w-1/3"
        on:change={async () => {
          if (filter === 'chart') {
            const resp = await api.GET('/charts/?query_song=1&pagination=0', access_token);
            if (resp.ok) {
              chartList = await resp.json();
            } else {
              console.log(await resp.json());
            }
          }
        }}
      >
        <option value="player">{$t('record.player_id')}</option>
        <option value="chart">{$t('chart.chart')}</option>
        <option value="full_combo">{$t('record.full_combo')}</option>
        <option value="lowest_score">{$t('record.lowest_score')}</option>
        <option value="highest_score">{$t('record.highest_score')}</option>
        <option value="lowest_acc">{$t('record.lowest_acc')}</option>
        <option value="highest_acc">{$t('record.highest_acc')}</option>
        <option value="lowest_rks">{$t('record.lowest_rks')}</option>
        <option value="highest_rks">{$t('record.highest_rks')}</option>
      </select>
      {#if filter === 'chart' || filter === 'full_combo'}
        <select bind:value={filterParam} class="select select-bordered w-1/2">
          {#if filter === 'chart' && chartList}
            {#each chartList as chart}
              {#if typeof chart.song === 'object'}
                <option value={`${chart.id}`}>
                  {chart.song.name} [{chart.level}
                  {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}]
                </option>
              {/if}
            {/each}
          {:else if filter === 'full_combo'}
            <option value="1">{$t('common.true')}</option>
            <option value="0">{$t('common.false')}</option>
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
        <option value="id">{$t('record.id')}</option>
        <option value="score">{$t('record.score')}</option>
        <option value="acc">{$t('record.acc')}</option>
        <option value="rks">{$t('record.rks')}</option>
        <option value="perfect">{$t('record.perfect')}</option>
        <option value="good_early">{$t('record.good_early')}</option>
        <option value="good_late">{$t('record.good_late')}</option>
        <option value="bad">{$t('record.bad')}</option>
        <option value="miss">{$t('record.miss')}</option>
        <option value="player">{$t('record.player')}</option>
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
        }}
      >
        {$t('common.continue')}
      </button>
    </div>
  </div>
</div> -->

<div class="page">
  <h1 class="text-4xl font-bold">{$t('common.records')}</h1>
  <SearchOptions
    params={searchParams}
    filters={[
      { value: 'id', name: $t('record.id'), options: 'number' },
      { value: 'chartId', name: $t('chart.id'), options: 'number' },
      { value: 'ownerId', name: $t('record.player_id'), options: 'number' },
      {
        value: 'isFullCombo',
        name: $t('record.full_combo'),
        options: [
          { value: '1', name: $t('common.yes') },
          { value: '0', name: $t('common.no') },
        ],
      },
      { value: 'score', name: $t('record.score'), options: 'range' },
      { value: 'acc', name: $t('record.acc'), options: 'range' },
      { value: 'rks', name: $t('record.rks'), options: 'range' },
    ]}
    orders={[
      { value: 'id', name: $t('record.id') },
      { value: 'chart', name: $t('chart.id') },
      { value: 'player', name: $t('record.player_id') },
      { value: 'score', name: $t('record.score') },
      { value: 'accuracy', name: $t('record.acc') },
      { value: 'rks', name: $t('record.rks') },
    ]}
  />
  {#if $query.isSuccess}
    {@const { data, total } = $query.data}
    {#if data && data.length > 0}
      <div class="result">
        {#each data as record}
          <Record {record} />
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
