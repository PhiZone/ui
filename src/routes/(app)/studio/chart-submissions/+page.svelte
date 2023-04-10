<script lang="ts">
  import { t } from '$lib/translations/config';
  import * as api from '$lib/api';
  import { onMount } from 'svelte';
  import { Status } from '$lib/constants';
  import Submission from '$lib/components/chart_submission.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { ChartSubmission, Song, SongSubmission, User } from '$lib/models';
  import { page } from '$app/stores';
  export let data: import('./$types').PageData;
  $: ({ status, content, error, user, access_token } = data);

  let pageIndex = 1,
    submissionCount: number,
    pageStatus = Status.RETRIEVING,
    submissions: ChartSubmission[],
    previousSubmissions: string,
    nextSubmissions: string,
    filter: string | null = null,
    filterParam: string | null = null,
    songList: Song[],
    songSubmissionList: SongSubmission[],
    order: string | null = null,
    reverse = false;

  onMount(() => {
    pageStatus = status;
    if (status === Status.OK) {
      submissions = content.results;
      submissionCount = content.count;
      previousSubmissions = content.previous;
      nextSubmissions = content.next;
    } else {
      console.log('status:', status);
      console.log('error:', error);
    }
  });
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.chart_submission')} | {$t('common.title')}
  </title>
</svelte:head>

<input type="checkbox" id="list-options" class="modal-toggle" />
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
          if (filter === 'song') {
            const resp = await api.GET('/songs/?pagination=0', access_token);
            if (resp.ok) {
              songList = await resp.json();
            } else {
              console.log(await resp.json());
            }
          } else if (filter === 'song_upload') {
            const resp = await api.GET('/song_uploads/?pagination=0', access_token);
            if (resp.ok) {
              songSubmissionList = await resp.json();
            } else {
              console.log(await resp.json());
            }
          } else if (filter === 'status') {
            filterParam = '0';
          }
        }}
      >
        <option value="status">{$t('studio.submission.overall_status')}</option>
        <option value="uploader">{$t('studio.submission.uploader_id')}</option>
        <option value="song">{$t('song.song')}</option>
        <option value="song_upload">{$t('studio.song_submission')}</option>
      </select>
      {#if filter !== 'uploader'}
        <select bind:value={filterParam} class="select select-bordered w-1/2">
          {#if filter === 'status'}
            <option value="0">{$t('studio.submission.statuses.0')}</option>
            <option value="1">{$t('studio.submission.statuses.1')}</option>
            <option value="2">{$t('studio.submission.statuses.2')}</option>
          {:else if filter === 'song' && songList}
            {#each songList as song}
              <option value={`${song.id}`}>{song.composer} - {song.name} ({song.edition})</option>
            {/each}
          {:else if filter === 'song_upload' && songSubmissionList}
            {#each songSubmissionList as song}
              <option value={`${song.id}`}>{song.composer} - {song.name} ({song.edition})</option>
            {/each}
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
        <option value="level_type">{$t('chart.level_type')}</option>
        <option value="level">{$t('chart.level')}</option>
        <option value="difficulty">{$t('chart.difficulty')}</option>
        <option value="status">{$t('studio.submission.overall_status')}</option>
        <option value="uploader">{$t('studio.submission.uploader')}</option>
        <option value="song">{$t('song.song')}</option>
        <option value="song_upload">{$t('studio.song_submission')}</option>
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
</div>
<div class="bg-base-200 min-h-screen">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">
          {$t('studio.chart_submissions')}
        </h1>
        <div class="flex justify-between gap-3">
          <label for="list-options" class="btn btn-secondary text-lg btn-xl btn-outline glass">
            {$t('common.list_options')}
          </label>
          <a
            href="/studio/chart-submissions/new"
            class="btn btn-accent text-lg btn-xl btn-outline glass"
          >
            {$t('studio.upload_chart')}
          </a>
        </div>
      </div>
      <div class="min-w-fit form-control gap-4">
        {#if pageStatus === Status.OK && submissions}
          {#if submissions.length > 0}
            {#each submissions as submission}
              <Submission {submission} {user} />
            {/each}
            <Pagination
              bind:previous={previousSubmissions}
              bind:next={nextSubmissions}
              bind:results={submissions}
              bind:count={submissionCount}
              bind:pageIndex
              bind:status={pageStatus}
              token={access_token}
              {user}
            />
          {:else}
            <p class="py-3 text-center">{$t('common.empty')}</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>
