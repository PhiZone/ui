<script lang="ts">
  import { t } from '$lib/translations/config';
  import {
    getAvatar,
    getUserColor,
    getUserLevel,
    parseDateTime,
    parseMonthAndDay,
    toLocalTime,
  } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Record from '$lib/components/Record.svelte';
  import Follow from '$lib/components/Follow.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Song from '$lib/components/Song.svelte';
  import { PAGINATION_PER_PAGE } from '$lib/constants';
  import Error from '$lib/components/Error.svelte';
  import Region from '$lib/components/Region.svelte';
  import ApplicationLink from '$lib/components/ApplicationLink.svelte';

  export let data;

  let userNameEl: HTMLParagraphElement;
  let userNameOffsetWidth = 0;

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

  $: isUserNameEllipsis = userNameEl && userNameOffsetWidth != userNameEl.scrollWidth;
</script>

<svelte:head>
  <title>{$t('user.user')} - {$user.data?.data.userName ?? ''} | {$t('common.site_name')}</title>
</svelte:head>

{#if $user.isSuccess}
  {@const user = $user.data.data}
  <div class="info-page">
    <div class="mx-4 md:w-full max-w-[1800px]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('user.user')}
        </span>
        <div
          class="card card-side flex-col md:flex-row w-full bg-base-100 border-2 normal-border transition hover:shadow-lg"
        >
          <figure
            class="border-r-0 md:border-r md:max-w-[28%] px-6 py-6 flex flex-col normal-border mx-auto overflow-visible"
          >
            <div class="avatar min-w-fit h-fit">
              <div
                class="mx-auto w-[140px] h-[140px] rounded-full m-2 border-[4px] border-{getUserColor(
                  user.role,
                )}"
              >
                <img src={getAvatar(user.avatar, 60)} alt="Avatar" />
                {#if user.dateOfBirth && toLocalTime(user.dateOfBirth).getMonth() === new Date().getMonth() && toLocalTime(user.dateOfBirth).getDate() === new Date().getDate()}
                  <img
                    src="https://res.phizone.cn/cDoKFCtSeSUrQwPOCg9KPmEIihjLrQtW/party-hat.png"
                    alt="Birthday Hat"
                    class="absolute -top-16 ml-8"
                    style="width: 128px; height: 128px;"
                  />
                {/if}
              </div>
            </div>
            <div class="flex flex-col gap-1 h-fit pb-3">
              <p
                bind:this={userNameEl}
                bind:offsetWidth={userNameOffsetWidth}
                class={'text-3xl text-center font-bold h-fit text-ellipsis'}
                class:tooltip={isUserNameEllipsis}
                style="overflow-inline: clip;"
                data-tip={user.userName}
              >
                {user.userName}
              </p>
              <div class="flex items-center justify-center gap-1 h-fit">
                <span class="badge badge-sm font-bold">LV{getUserLevel(user.experience)}</span>
                {#if user.gender === 1}
                  <span class="badge badge-sm">
                    <i class="fa-solid fa-mars"></i>
                  </span>
                {:else if user.gender === 2}
                  <span class="badge badge-sm">
                    <i class="fa-solid fa-venus"></i>
                  </span>
                {/if}
                {#if user.tag}
                  <span class="badge badge-sm badge-accent">{user.tag}</span>
                {/if}
              </div>
              <Region region={user.region} width={21} overallCss="justify-center" />
            </div>
            <div class="w-full form-control gap-0.5 h-fit">
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
            {#if user.applicationLinks}
              <div class="flex flex-col gap-2 justify-start py-3 h-fit">
                {#each user.applicationLinks as appLink}
                  <ApplicationLink {appLink} kind="mini" />
                {/each}
              </div>
            {/if}
            <div>
              <div class="flex justify-center my-3 h-fit">
                <Follow {user} instantResp={false} />
              </div>
            </div>
          </figure>
          <div class="card-body py-3">
            {#if $charts.isSuccess}
              {@const total = $charts.data.total}
              {@const charts = $charts.data.data}
              <div class="flex items-center mt-6 mb-2 justify-between">
                <h2 class="text-3xl font-bold">
                  {$t('user.charts')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm border-2 normal-border btn-outline"
                    href="/charts?rangeOwnerId={user.id}"
                  >
                    {$t('common.all')}
                    <i class="fa-solid fa-angles-right"></i>
                  </a>
                {/if}
              </div>
              {#if charts.length > 0}
                <div class="result">
                  {#each charts as chart}
                    <Chart {chart} />
                  {/each}
                </div>
                <!-- <ul class="menu bg-base-100 w-full p-0">
                  {#each charts as chart}
                    <li><Chart {chart} kind="inline" /></li>
                  {/each}
                </ul> -->
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $songs.isSuccess}
              {@const total = $songs.data.total}
              {@const songs = $songs.data.data}
              <div class="flex items-center mt-6 mb-2 justify-between">
                <h2 class="text-3xl font-bold">
                  {$t('user.songs')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm border-2 normal-border btn-outline"
                    href="/songs?rangeOwnerId={user.id}"
                  >
                    {$t('common.all')}
                    <i class="fa-solid fa-angles-right"></i>
                  </a>
                {/if}
              </div>
              {#if songs.length > 0}
                <div class="result">
                  {#each songs as song}
                    <Song {song} />
                  {/each}
                </div>
                <!-- <ul class="menu bg-base-100 w-full p-0">
                  {#each songs as song}
                    <li><Song {song} kind="inline" /></li>
                  {/each}
                </ul> -->
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
            {#if $recentRecords.isSuccess}
              {@const total = $recentRecords.data.total}
              {@const recentRecords = $recentRecords.data.data}
              <div class="flex items-center mt-6 mb-2 justify-between">
                <h2 class="text-3xl font-bold">
                  {$t('user.recent_records')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm border-2 normal-border btn-outline"
                    href="/records?rangeOwnerId={user.id}"
                  >
                    {$t('common.all')}
                    <i class="fa-solid fa-angles-right"></i>
                  </a>
                {/if}
              </div>
              {#if recentRecords.length > 0}
                <div class="result">
                  {#each recentRecords as record}
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
              <div class="flex items-center mt-6 mb-2 justify-between">
                <h2 class="text-3xl font-bold">
                  {$t('user.best_records')}
                </h2>
                {#if total && total > PAGINATION_PER_PAGE}
                  <a
                    class="min-w-fit btn btn-sm border-2 normal-border btn-outline"
                    href="/records?rangeOwnerId={user.id}&order=rks&desc=true"
                  >
                    {$t('common.all')}
                    <i class="fa-solid fa-angles-right"></i>
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
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if $user.isError}
  <Error error={$user.error} back="/users" />
{:else}
  <div class="min-h-page skeleton" />
{/if}
