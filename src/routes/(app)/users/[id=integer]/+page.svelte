<script lang="ts">
  import { t } from '$lib/translations/config';
  import { getUserLevel, parseDateTime, parseMonthAndDay } from '$lib/utils';
  import Like from '$lib/components/Like.svelte';
  import Record from '$lib/components/Record.svelte';
  import Comment from '$lib/components/Comment.svelte';
  import type { PageData } from './$types';
  import Follow from '$lib/components/Follow.svelte';
  import { createQuery } from '@tanstack/svelte-query';
  import Chart from '$lib/components/Chart.svelte';
  import Song from '$lib/components/Song.svelte';

  export let data: PageData;

  $: ({ searchParams, id, api } = data);

  $: user = createQuery(api.user.info({ id }));
  $: charts = createQuery(api.chart.list({ owner: id }));
  $: songs = createQuery(api.song.list({ uploader: id }));
  $: recent_records = createQuery(api.record.list({ player: id, order_by: 'time', order: 'desc' }));
  $: best_records = createQuery(api.record.list({ player: id, order_by: 'rks', order: 'desc' }));
  $: comments = createQuery(api.comment.list({ user: id }));
</script>

<svelte:head>
  <title>{$t('user.user')} - {$user.data?.username ?? ''} | {$t('common.title')}</title>
</svelte:head>

{#if $user.isSuccess}
  {@const user = $user.data}
  <div class="info-page">
    <div class="mx-4 w-full max-w-[1800px]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('user.user')}
        </span>
        <div class="card card-side min-w-fit w-full bg-base-100 border border-base-300 shadow-lg">
          <figure
            class="min-w-[150px] max-w-[28%] px-6 py-6 form-control border-r border-base-300 mx-auto overflow-visible"
          >
            <div class="avatar min-w-fit h-fit">
              <div
                class={`mx-auto w-[140px] h-[140px] rounded-full m-2 border-[4px] ${
                  user.type == 'admin'
                    ? 'border-indigo-500'
                    : user.type == 'volunteer'
                    ? 'border-emerald-500'
                    : user.type == 'qualified'
                    ? 'border-sky-500'
                    : 'border-neutral-500'
                }`}
              >
                <img src={user.avatar} alt="Avatar" />
              </div>
            </div>
            <p class="text-3xl text-center font-bold h-fit">
              {user.username}
            </p>
            <div class="flex items-center justify-center gap-1 h-fit">
              <span class="badge badge-sm font-bold">LV{getUserLevel(user.exp)}</span>
              {#if user.gender == 1}
                <span class="badge badge-sm">
                  <svg
                    fill="currentColor"
                    width="20px"
                    height="20px"
                    viewBox="-7 0 32 32"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.56 8.060c0-0.44-0.36-0.88-0.84-0.88h-4.6c-0.48 0-0.84 0.36-0.84 0.84s0.36 0.84 0.84 0.84h2.6l-3.6 3.6c-1.16-0.92-2.64-1.48-4.24-1.48-3.76 0.080-6.88 3.16-6.88 6.96s3.12 6.88 6.88 6.88 6.88-3.080 6.88-6.88c0-1.6-0.56-3.040-1.48-4.24l3.6-3.6v2.76c0 0.48 0.36 0.84 0.84 0.84s0.84-0.36 0.84-0.84c0 0 0-4.8 0-4.8zM6.88 23.14c-2.88 0-5.2-2.32-5.2-5.2s2.32-5.2 5.2-5.2 5.2 2.32 5.2 5.2-2.32 5.2-5.2 5.2z"
                    />
                  </svg>
                </span>
              {:else if user.gender == 2}
                <span class="badge badge-sm">
                  <svg
                    fill="currentColor"
                    width="20px"
                    height="20px"
                    viewBox="-9 0 32 32"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M13.76 12.040c0-3.8-3.080-6.88-6.88-6.88s-6.88 3.12-6.88 6.88c0 3.52 2.64 6.4 6.040 6.84v3.56h-2c-0.48 0-0.84 0.36-0.84 0.84s0.36 0.84 0.84 0.84h2v1.88c0 0.48 0.36 0.84 0.84 0.84s0.84-0.36 0.84-0.84v-1.88h2c0.48 0 0.84-0.36 0.84-0.84s-0.36-0.84-0.84-0.84h-2v-3.56c3.4-0.44 6.040-3.32 6.040-6.84zM1.68 12.040c0-2.88 2.32-5.2 5.2-5.2s5.2 2.32 5.2 5.2-2.32 5.2-5.2 5.2-5.2-2.32-5.2-5.2z"
                    />
                  </svg>
                </span>
              {/if}
              {#if user.tag}
                <span class="badge badge-sm badge-accent">{user.tag}</span>
              {/if}
            </div>
            <div class="mt-4 w-full form-control gap-0.5 h-fit">
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('user.id')}</span>
                {user.id}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('user.type')}</span>
                {$t(`user.types.${user.type}`)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('user.rks')}</span>
                {user.rks.toFixed(3)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('user.exp')}</span>
                {user.exp}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('user.language')}</span>
                {$t(`common.lang.${user.language}`)}
              </p>
              <a href="/users/{user.id}/following" class="group">
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('user.following')}
                </span>
                <span class="group-hover:underline">
                  {user.following}
                </span>
              </a>
              <a href="/users/{user.id}/fans" class="group">
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('user.fans')}
                </span>
                <span class="group-hover:underline">
                  {user.fans}
                </span>
              </a>
              {#if user.date_of_birth}
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('user.date_of_birth')}
                  </span>
                  {parseMonthAndDay(user.date_of_birth)}
                </p>
              {/if}
              {#if user.last_login}
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('user.last_login')}
                  </span>
                  {parseDateTime(user.last_login)}
                </p>
              {/if}
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('user.date_joined')}</span>
                {parseDateTime(user.date_joined)}
              </p>
              {#if user.bio}
                <p class="content">
                  <span class="badge badge-primary badge-outline mr-1">{$t('user.bio')}</span>
                  {user.bio}
                </p>
              {/if}
            </div>
            <div>
              <div class="flex justify-center my-3 h-fit">
                <Follow {id} {user} />
              </div>
            </div>
          </figure>
          <div class="card-body pt-3 max-w-full">
            {#if $charts.isSuccess}
              {@const count = $charts.data.count}
              {@const charts = $charts.data.results.slice(0, 10)}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.charts')}
                </h2>
                {#if count > 10}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/charts?owner={user.id}"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if charts.length > 0}
                <ul class="menu bg-base-100 w-full border border-base-300">
                  {#each charts as chart}
                    <li><Chart {chart} kind="inline" /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $songs.isSuccess}
              {@const count = $songs.data.count}
              {@const songs = $songs.data.results.slice(0, 10)}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.songs')}
                </h2>
                {#if count > 10}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/songs?uploader={user.id}"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if songs.length > 0}
                <ul class="menu bg-base-100 w-full border border-base-300">
                  {#each songs as song}
                    <li><Song {song} kind="inline" /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $recent_records.isSuccess}
              {@const count = $recent_records.data.count}
              {@const recent_records = $recent_records.data.results.slice(0, 10)}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.recent_records')}
                </h2>
                {#if count > 10}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/records?player={user.id}"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if recent_records.length > 0}
                <div class="grid-result">
                  {#each recent_records as record}
                    <Record {record} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $best_records.isSuccess}
              {@const count = $best_records.data.count}
              {@const best_records = $best_records.data.results.slice(0, 10)}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.best_records')}
                </h2>
                {#if count > 10}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/records?player={user.id}&order=-rks"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if best_records.length > 0}
                <div class="grid-result">
                  {#each best_records as record}
                    <Record {record} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $comments.isSuccess}
              {@const comments = $comments.data.results}
              <h2 class="text-3xl font-bold mt-6 mb-2">
                {$t('user.comments')}
              </h2>
              {#if comments.length > 0}
                <div class="form-control gap-1">
                  {#each comments as comment}
                    <Comment {searchParams} {comment} showUser={false} showSource />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .grid-result {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    grid-gap: 1rem;
  }
</style>
