<script lang="ts">
  import { t } from '$lib/translations/config';
  import {
    getAvatar,
    getUserColor,
    getUserLevel,
    parseDateTime,
    parseMonthAndDay,
  } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Record from '$lib/components/Record.svelte';
  import Follow from '$lib/components/Follow.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Song from '$lib/components/Song.svelte';
  import { PAGINATION_PER_PAGE } from '$lib/constants';

  export let data;

  $: ({ id, api } = data);

  $: user = createQuery(api.user.info({ id }));
  $: charts = createQuery(api.chart.list({ rangeOwnerId: [id] }));
  $: songs = createQuery(api.song.list({ rangeOwnerId: [id] }));
  $: recentRecords = createQuery(
    api.record.list({ rangeOwnerId: [id], order: ['dateCreated'], desc: [true] }),
  );
  $: bestRecords = createQuery(
    api.record.list({ rangeOwnerId: [id], order: ['rks'], desc: [true] }),
  );
</script>

<svelte:head>
  <title>{$t('user.user')} - {$user.data?.data.userName ?? ''} | {$t('common.title')}</title>
</svelte:head>

{#if $user.isSuccess}
  {@const user = $user.data.data}
  <div class="info-page">
    <div class="mx-4 w-full max-w-[1800px]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('user.user')}
        </span>
        <div
          class="card card-side flex-col md:flex-row min-w-fit w-full bg-base-100 border border-base-300 shadow-lg"
        >
          <figure
            class="min-w-[150px] border-r-0 md:border-r md:max-w-[28%] px-6 py-6 form-control border-base-300 mx-auto overflow-visible"
          >
            <div class="avatar min-w-fit h-fit">
              <div
                class="mx-auto w-[140px] h-[140px] rounded-full m-2 border-[4px] border-{getUserColor(
                  user.role,
                )}"
              >
                <img src={getAvatar(user.avatar, 60)} alt="Avatar" />
              </div>
            </div>
            <p class="text-3xl text-center font-bold h-fit">
              {user.userName}
            </p>
            <div class="flex items-center justify-center gap-1 h-fit">
              <span class="badge badge-sm font-bold">LV{getUserLevel(user.experience)}</span>
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
                <span class="badge mr-1">{$t('user.id')}</span>
                {user.id}
              </p>
              <p>
                <span class="badge mr-1">{$t('user.role')}</span>
                {$t(`user.roles.${user.role !== '' ? user.role : 'Unactivated'}`)}
              </p>
              <p>
                <span class="badge mr-1">{$t('user.rks')}</span>
                {user.rks.toFixed(3)}
              </p>
              <p>
                <span class="badge mr-1">{$t('user.exp')}</span>
                {user.experience.toLocaleString()}
              </p>
              <p>
                <span class="badge mr-1">{$t('user.language')}</span>
                {$t(`common.lang.${user.language}`)}
              </p>
              <a href="/users/{user.id}/following" class="group">
                <span class="badge mr-1">
                  {$t('user.following')}
                </span>
                <span class="group-hover:underline">
                  {user.followeeCount}
                </span>
              </a>
              <a href="/users/{user.id}/fans" class="group">
                <span class="badge mr-1">
                  {$t('user.fans')}
                </span>
                <span class="group-hover:underline">
                  {user.followerCount}
                </span>
              </a>
              {#if user.dateOfBirth}
                <p>
                  <span class="badge mr-1">
                    {$t('user.date_of_birth')}
                  </span>
                  {parseMonthAndDay(user.dateOfBirth)}
                </p>
              {/if}
              {#if user.dateLastLoggedIn}
                <p>
                  <span class="badge mr-1">
                    {$t('user.last_login')}
                  </span>
                  {parseDateTime(user.dateLastLoggedIn)}
                </p>
              {/if}
              <p>
                <span class="badge mr-1">{$t('user.date_joined')}</span>
                {parseDateTime(user.dateJoined)}
              </p>
              {#if user.biography}
                <p class="content">
                  <span class="badge mr-1">{$t('user.bio')}</span>
                  {user.biography}
                </p>
              {/if}
            </div>
            <div>
              <div class="flex justify-center my-3 h-fit">
                <Follow {user} instantResp={false} />
              </div>
            </div>
          </figure>
          <div class="card-body pt-3 max-w-full">
            {#if $charts.isSuccess}
              {@const total = $charts.data.total}
              {@const charts = $charts.data.data}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.charts')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/charts?rangeOwnerId={user.id}"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if charts.length > 0}
                <ul class="menu bg-base-100 w-full p-0">
                  {#each charts as chart}
                    <li><Chart {chart} kind="inline" /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $songs.isSuccess}
              {@const total = $songs.data.total}
              {@const songs = $songs.data.data}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.songs')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/songs?rangeOwnerId={user.id}"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if songs.length > 0}
                <ul class="menu bg-base-100 w-full p-0">
                  {#each songs as song}
                    <li><Song {song} kind="inline" /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $recentRecords.isSuccess}
              {@const total = $recentRecords.data.total}
              {@const recent_records = $recentRecords.data.data}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.recent_records')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/records?rangeOwnerId={user.id}"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if recent_records.length > 0}
                <div class="result">
                  {#each recent_records as record}
                    <Record {record} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $bestRecords.isSuccess}
              {@const total = $bestRecords.data.total}
              {@const best_records = $bestRecords.data.data}
              <div class="flex items-center mt-6 mb-2">
                <h2 class="text-3xl font-bold w-full">
                  {$t('user.best_records')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm btn-primary btn-outline"
                    href="/records?rangeOwnerId={user.id}&order=rks&desc=true"
                  >
                    {$t('common.all')}
                  </a>
                {/if}
              </div>
              {#if best_records.length > 0}
                <div class="result">
                  {#each best_records as record}
                    <Record {record} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            <!-- {#if $comments.isSuccess}
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
            {/if} -->
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
