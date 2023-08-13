<script lang="ts">
  import { t } from '$lib/translations/config';
  import * as api from '$lib/api';
  import { onMount } from 'svelte';
  import { Status } from '$lib/constants';
  import Request from '$lib/components/recorder_request.svelte';
  import { getUserPrivilege } from '$lib/utils';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { RecorderRequest, User } from '$lib/models';
  import { page } from '$app/stores';

  export let data: import('./$types').PageData;
  $: ({ status, search, content, error, user, access_token } = data);

  let pageIndex = 1,
    requestCount: number,
    pageStatus = Status.RETRIEVING,
    requests: RecorderRequest[],
    previousRequests: string,
    nextRequests: string,
    filter: string | null = null,
    filterParam: string | null = null,
    order: string | null = null,
    reverse = false;

  onMount(() => {
    pageStatus = status;
    if (status === Status.OK) {
      requests = content.results;
      requestCount = content.count;
      previousRequests = content.previous;
      nextRequests = content.next;
    } else {
      console.log('status:', status);
      console.log('error:', error);
    }
  });
</script>

<svelte:head>
  <title>
    {$t('recorder.request')} - {$t(
      user && getUserPrivilege(user.type) >= 3 ? 'recorder.manage' : 'recorder.history',
    )} |
    {$t('common.title')}
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
        on:change={() => {
          if (filter === 'status') {
            filterParam = '0';
          }
        }}
      >
        <option value="status">{$t('recorder.status')}</option>
        <option value="user">{$t('recorder.requester_id')}</option>
        <option value="replier">{$t('recorder.replier_id')}</option>
      </select>
      {#if filter === 'status'}
        <select bind:value={filterParam} class="select select-bordered w-1/2">
          <option value="0">{$t('recorder.statuses.0')}</option>
          <option value="1">{$t('recorder.statuses.1')}</option>
          <option value="2">{$t('recorder.statuses.2')}</option>
          <option value="3">{$t('recorder.statuses.3')}</option>
          <option value="4">{$t('recorder.statuses.4')}</option>
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
        <option value="id">{$t('recorder.req_id')}</option>
        <option value="level">{$t('common.form.chart_level')}</option>
        <option value="difficulty">{$t('common.form.chart_difficulty_1')}</option>
        <option value="status">{$t('recorder.status')}</option>
        <option value="user">{$t('recorder.requester')}</option>
        <option value="replier">{$t('recorder.replier')}</option>
        <option value="replied_at">{$t('recorder.replied_at')}</option>
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
                  `${filter}=${filterParam}`,
                )}`
              : order && $page.url.search.includes('order')
              ? `${$page.url.pathname}${$page.url.search.replace(
                  /order=[^&]*/g,
                  `order=${reverse ? '-' : ''}${order}`,
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
<div class="bg-base-200 page">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">
          {$t(user && getUserPrivilege(user.type) >= 3 ? 'recorder.manage' : 'recorder.history')}
        </h1>
        <div class="flex justify-between gap-3">
          <label for="list-options" class="btn btn-secondary text-lg btn-xl btn-outline glass">
            {$t('common.list_options')}
          </label>
          <a href="/recorder/requests/new" class="btn btn-accent text-lg btn-xl btn-outline glass">
            {$t('recorder.new_request')}
          </a>
        </div>
      </div>
      <div class="min-w-fit form-control gap-4">
        {#if pageStatus === Status.OK && requests}
          {#if requests.length > 0}
            {#each requests as request}
              <Request
                id={request.id}
                name={request.name}
                illustration={request.illustration}
                level={request.level}
                difficulty={request.difficulty}
                status={request.status}
                showUser={getUserPrivilege(user.type) >= 3}
                user={request.user}
                replier={request.replier}
                requested_at={request.requested_at}
                replied_at={request.replied_at}
              />
            {/each}
            <Pagination
              bind:previous={previousRequests}
              bind:next={nextRequests}
              bind:results={requests}
              bind:count={requestCount}
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

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
