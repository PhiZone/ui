<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { enhance } from '$app/forms';
  import { t } from '$lib/translations/config';
  import {
    getLevelColor,
    getLevelDisplay,
    getUserLevel,
    getUserPrivilege,
    parseDateTime,
  } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import { Status } from '$lib/constants';
  import Song from '$lib/components/Song.svelte';
  import User from '$lib/components/User.svelte';
  import Like from '$lib/components/Like.svelte';
  import Record from '$lib/components/Record.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import ChartRadar from '$lib/components/ChartRadar.svelte';
  import Rating from '$lib/components/Rating.svelte';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import ChartAsset from '$lib/components/ChartAsset.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data, form;
  const {
    searchParams,
    id,
    user,
    api,
    queryClient,
    preferredPlayConfiguration,
    preferredApplication,
  } = data;

  const getMultiplier = (level: number): number => {
    switch (level) {
      case 0:
        return 0.0;
      case 1:
        return 1.0;
      case 2:
        return 1.1;
      case 3:
        return 1.2;
      case 4:
        return 1.3;
      case 5:
        return 1.4;
      case 6:
        return 1.5;
      case 7:
        return 1.6;
      case 8:
        return 1.8;
      case 9:
        return 2.0;
      case 10:
        return 3.0;
    }
    return 0;
  };

  $: chart = createQuery(api.chart.info({ id }));
  $: song = createQuery(
    api.song.info({ id: $chart.data?.data.songId ?? '' }, { enabled: $chart.isSuccess }),
  );
  $: records = createQuery(
    api.record.listChart({ chartId: id, order: ['rks', 'dateCreated'], desc: [true, true] }),
  );
  $: votes = createQuery(api.vote.listAll({ chartId: id }));
  $: myVote = createQuery(api.vote.listAll({ chartId: id, rangeOwnerId: [user?.id ?? 0] }));
  $: charter = richtext($chart.data?.data.authorName ?? '');

  $: preferredPlayConfigurationQuery = createQuery(
    api.playConfiguration.list(
      { rangeId: [preferredPlayConfiguration ?? ''] },
      { enabled: !!preferredPlayConfiguration && !!user },
    ),
  );
  $: preferredApplicationQuery = createQuery(
    api.application.list(
      { rangeId: [preferredApplication ?? ''], rangeType: [0] },
      { enabled: !!preferredApplication && !!user },
    ),
  );

  $: playConfigurations = createQuery(
    api.playConfiguration.listAll(
      { rangeOwnerId: [user?.id ?? 0] },
      { enabled: playOpen && !!user },
    ),
  );
  $: applications = createQuery(
    api.application.listAll({ rangeType: [0] }, { enabled: playOpen && !!user }),
  );
  $: assets = createQuery(api.chart.asset.list({ ...searchParams, chartId: id }));

  let status = Status.WAITING;
  let arrangement = 0;
  let gameplay = 0;
  let vfx = 0;
  let creativity = 0;
  let concord = 0;
  let impression = 0;
  let voteOpen = false;
  let voteSync = false;
  let playOpen = false;
  let selectedPlayConfiguration = preferredPlayConfiguration ?? '';
  let selectedApplication = preferredApplication ?? '';
  let playStatus = Status.WAITING;

  $: if (!voteSync && $myVote.isSuccess && $myVote.data.data.length > 0) {
    arrangement = $myVote.data.data[0].arrangement;
    gameplay = $myVote.data.data[0].gameplay;
    vfx = $myVote.data.data[0].visualEffects;
    creativity = $myVote.data.data[0].creativity;
    concord = $myVote.data.data[0].concord;
    impression = $myVote.data.data[0].impression;
    voteSync = true;
  }
</script>

<svelte:head>
  <title>
    {$t('chart.chart')} -
    {$chart.isSuccess
      ? `${$chart.data.data.title ?? $song.data?.data.title} [${
          $chart.data.data.level
        } ${getLevelDisplay($chart.data.data.difficulty)}]`
      : ''}
    | {$t('common.title')}
  </title>
</svelte:head>

{#if $chart.isSuccess}
  {@const chart = $chart.data.data}
  {#if user}
    <input type="checkbox" id="play" class="modal-toggle" bind:checked={playOpen} />
    <div class="modal" role="dialog">
      <div class="modal-box min-w-[30vw]">
        <label
          for="play"
          class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
        >
          ✕
        </label>
        <h3 class="font-bold text-lg mb-2">{$t('chart.play')}</h3>
        <div class="form-control gap-4">
          {#if $playConfigurations.isSuccess}
            <label class="join w-full">
              <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                {$t('play_configuration.play_configuration')}
              </span>
              <select
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                bind:value={selectedPlayConfiguration}
                class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
              >
                {#each $playConfigurations.data.data as playConfiguration}
                  <option value={playConfiguration.id}>
                    {playConfiguration.name ?? $t('common.unnamed')} [{playConfiguration.perfectJudgment}
                    / {playConfiguration.goodJudgment}]
                  </option>
                {/each}
              </select>
            </label>
          {/if}
          {#if $applications.isSuccess}
            <label class="join w-full">
              <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                {$t('application.application')}
              </span>
              <select
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                bind:value={selectedApplication}
                class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
              >
                {#each $applications.data.data as application}
                  <option value={application.id}>
                    [{$t(`application.types.${application.type}`)}] {application.name}
                  </option>
                {/each}
              </select>
            </label>
          {/if}
          <div class="card-actions justify-end">
            <button
              class="btn {!selectedPlayConfiguration ||
              !selectedApplication ||
              playStatus === Status.SENDING
                ? 'btn-disabled'
                : playStatus === Status.ERROR
                  ? 'btn-error'
                  : 'border-2 normal-border btn-ghost hover:btn-outline'} join-item"
              on:click={async () => {
                playStatus = Status.SENDING;
                const resp = await api.chart.play({
                  chartId: chart.id,
                  configurationId: selectedPlayConfiguration ?? '',
                  applicationId: selectedApplication ?? '',
                });
                if (resp.ok && $applications.isSuccess) {
                  const data = await resp.json();
                  // console.log(
                  //   'Opening',
                  //   `${
                  //     $applications.data.data.find((e) => e.id == selectedApplication)?.apiEndpoint
                  //   }player=${user?.id}&chart=${
                  //     chart.id
                  //   }&configuration=${selectedPlayConfiguration}&token=${
                  //     data.data.token
                  //   }&timestamp=${data.data.timestamp}`,
                  // );
                  window.open(
                    `${
                      $applications.data.data.find((e) => e.id == selectedApplication)?.apiEndpoint
                    }player=${user?.id}&chart=${
                      chart.id
                    }&configuration=${selectedPlayConfiguration}&token=${
                      data.data.token
                    }&timestamp=${data.data.timestamp}`,
                    '_blank',
                  );
                  playOpen = false;
                  playStatus = Status.OK;
                } else {
                  playStatus = Status.ERROR;
                  console.error(
                    `\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`,
                    await resp.json(),
                  );
                }
              }}
            >
              <i class="fa-solid fa-play fa-lg"></i>
              {$t('chart.play')}
            </button>
          </div>
        </div>
      </div>
    </div>
    <input type="checkbox" id="chart-vote" class="modal-toggle" bind:checked={voteOpen} />
    <div class="modal">
      <div class="modal-box bg-base-100 min-w-fit w-[50vw] max-w-[1200px]">
        <label
          for="chart-vote"
          class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
        >
          ✕
        </label>
        <h2 class="font-bold text-xl mb-4">{$t('common.vote')}</h2>
        <form
          class="form-control gap-1"
          method="POST"
          action="?/vote"
          use:enhance={() => {
            status = Status.SENDING;

            return async ({ result, update }) => {
              if (result.type === 'failure') {
                status = Status.ERROR;
              } else if (result.type === 'success') {
                status = Status.OK;
                await queryClient.invalidateQueries(['chart.info', { id }]);
                // TODO: toast
                voteOpen = false;
              }
              await update();
            };
          }}
        >
          <div class="flex gap-3 items-center">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.arrangement')}
            </span>
            <div class="w-[70%]">
              <input
                id="arrangement"
                name="arrangement"
                type="range"
                min="0"
                max="5"
                bind:value={arrangement}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{arrangement}</p>
          </div>
          <div class="flex gap-3 items-center">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.gameplay')}
            </span>
            <div class="w-[70%]">
              <input
                id="gameplay"
                name="gameplay"
                type="range"
                min="0"
                max="5"
                bind:value={gameplay}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{gameplay}</p>
          </div>
          <div class="flex gap-3 items-center">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.vfx')}
            </span>
            <div class="w-[70%]">
              <input
                id="visualEffects"
                name="visualEffects"
                type="range"
                min="0"
                max="5"
                bind:value={vfx}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{vfx}</p>
          </div>
          <div class="flex gap-3 items-center">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.creativity')}
            </span>
            <div class="w-[70%]">
              <input
                id="creativity"
                name="creativity"
                type="range"
                min="0"
                max="5"
                bind:value={creativity}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{creativity}</p>
          </div>
          <div class="flex gap-3 items-center">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.concord')}
            </span>
            <div class="w-[70%]">
              <input
                id="concord"
                name="concord"
                type="range"
                min="0"
                max="5"
                bind:value={concord}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{concord}</p>
          </div>
          <div class="flex gap-3 items-center">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.impression')}
            </span>
            <div class="w-[70%]">
              <input
                id="impression"
                name="impression"
                type="range"
                min="0"
                max="5"
                bind:value={impression}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{impression}</p>
          </div>
          <div class="flex gap-3 items-center h-[29px]">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.multiplier')}
            </span>
            <p class="text-xl font-bold w-3/4">
              {getMultiplier(getUserLevel(user.experience)).toFixed(1)}
            </p>
          </div>
          <div class="flex gap-3 items-center h-[29px]">
            <span class="badge badge-lg badge-neutral text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.score')}
            </span>
            <p class="text-xl font-bold w-3/4">
              {(
                (arrangement + gameplay + vfx + creativity + concord + impression) *
                getMultiplier(getUserLevel(user.experience))
              ).toFixed(2)}
            </p>
          </div>
          <div class="modal-action">
            <div
              class="tooltip tooltip-top tooltip-error w-full"
              class:tooltip-open={status === Status.ERROR}
              data-tip={status === Status.ERROR
                ? $t(`error.${form?.error}`) ?? $t('common.unknown_error')
                : null}
            >
              <button
                type="submit"
                class="btn {status === Status.ERROR
                  ? 'btn-error'
                  : status === Status.SENDING
                    ? 'btn-ghost'
                    : 'btn-outline border-2 normal-border'} w-full"
                disabled={status == Status.SENDING}
              >
                {status === Status.ERROR
                  ? $t('common.error')
                  : status === Status.SENDING
                    ? $t('common.waiting')
                    : $t('common.submit')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  {/if}
  <div class="info-page">
    <div class="mx-4 min-w-[300px] max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.chart')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              {#if chart.title || $song.isSuccess}
                <h2 class="text-5xl font-bold content md:inline-block">
                  {chart.title ?? $song.data?.data.title}
                </h2>
              {:else}
                <div class="skeleton h-11 w-1/2"></div>
              {/if}
              <div class="join join-vertical md:join-horizontal min-w-fit">
                <button
                  class="btn {getLevelColor(chart.levelType)} join-item text-3xl no-animation"
                >
                  {chart.level}
                  {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
                </button>
                {#if chart.isRanked}
                  <button
                    class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg join-item text-3xl no-animation"
                  >
                    {$t('chart.ranked')}
                  </button>
                {/if}
              </div>
            </div>
            <div class="flex flex-col lg:flex-row">
              <div class="lg:w-1/2">
                <div class="pb-2">
                  <Rating rating={chart.rating} size="lg" />
                </div>
                <p>
                  <span class="badge mr-1">{$t('chart.level')}</span>
                  {chart.level}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('chart.difficulty')}
                  </span>
                  {chart.difficulty.toFixed(1)}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.charter')}</span>
                  {#if chart.authorName}
                    {@html $charter}
                  {:else}
                    {$t('common.anonymous')}
                  {/if}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.notes')}</span>
                  {chart.noteCount}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.format')}</span>
                  {$t(`chart.formats.${chart.format}`)}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.score')}</span>
                  {chart.score.toFixed(2)}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.rating')}</span>
                  {chart.rating.toFixed(2)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('chart.equivalent_vote_count')}
                  </span>
                  {chart.rating > 0 ? (chart.score / chart.rating).toFixed(2) : 0}
                </p>
                {#if $votes.isSuccess}
                  <p>
                    <span class="badge mr-1">
                      {$t('chart.real_vote_count')}
                    </span>
                    {$votes.data?.total}
                  </p>
                {/if}
                <p>
                  <span class="badge mr-1">
                    {$t('common.created_at')}
                  </span>
                  {parseDateTime(chart.dateCreated)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.updated_at')}
                  </span>
                  {parseDateTime(chart.dateUpdated)}
                </p>
                {#if chart.description}
                  <p class="content">
                    <span class="badge mr-1">
                      {$t('common.description')}
                    </span>
                    {chart.description}
                  </p>
                {/if}
              </div>
              <div class="divider lg:divider-horizontal" />
              <div class="lg:w-1/2 float-right p-4 form-control gap-3">
                <ChartRadar {chart} />
                <div
                  class="justify-center join join-vertical sm:join-horizontal lg:join-vertical xl:join-horizontal"
                >
                  <Like
                    id={chart.id}
                    likes={chart.likeCount}
                    type="charts"
                    liked={chart.dateLiked != null}
                    class="btn-md join-item"
                  />
                  <label
                    for="chart-vote"
                    class="btn {user
                      ? 'btn-ghost border-2 hover:btn-outline'
                      : 'btn-disabled'} join-item"
                  >
                    <i class="fa-solid fa-check-to-slot fa-lg"></i>
                    {$t('common.vote')}
                  </label>
                  {#if chart.file && user}
                    <a
                      href={chart.file}
                      target="_blank"
                      download={chart.file.split('/').pop()}
                      class="btn btn-ghost border-2 hover:btn-outline join-item"
                    >
                      <i class="fa-solid fa-file-arrow-down fa-lg"></i>
                      {$t('common.download')}
                    </a>
                    <a
                      href="{PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&mode=preview&flag=noRequestingFullscreen&chart={encodeURI(
                        chart.file,
                      )}&song={encodeURI($song.data?.data.file ?? '')}&illustration={encodeURI(
                        $song.data?.data.illustration ?? '',
                      )}&name={chart.title ??
                        $song.data?.data.title}&level={chart.level}&difficulty={chart.difficulty !=
                      0
                        ? Math.floor(chart.difficulty)
                        : '?'}&composer={$song.data?.data.authorName}&illustrator={$song.data?.data
                        .illustrator}&charter={chart.authorName}"
                      class="btn btn-ghost border-2 hover:btn-outline join-item"
                      target="_target"
                    >
                      <i class="fa-solid fa-eye fa-lg"></i>
                      {$t('common.preview')}
                    </a>
                    {#if chart.accessibility !== 2}
                      <button
                        class="btn btn-ghost border-2 hover:btn-outline join-item"
                        on:click={async () => {
                          if (
                            $preferredPlayConfigurationQuery.isSuccess &&
                            $preferredPlayConfigurationQuery.data.data.length > 0 &&
                            $preferredApplicationQuery.isSuccess &&
                            $preferredApplicationQuery.data.data.length > 0
                          ) {
                            const resp = await api.chart.play({
                              chartId: chart.id,
                              configurationId: $preferredPlayConfigurationQuery.data.data[0].id,
                              applicationId: $preferredApplicationQuery.data.data[0].id,
                            });
                            if (resp.ok) {
                              const data = await resp.json();
                              console.log(
                                'Opening',
                                `${$preferredApplicationQuery.data.data[0].apiEndpoint}player=${user?.id}&chart=${chart.id}&configuration=${$preferredPlayConfigurationQuery.data.data[0].id}&token=${data.data.token}&timestamp=${data.data.timestamp}`,
                              );
                              window.open(
                                `${$preferredApplicationQuery.data.data[0].apiEndpoint}player=${user?.id}&chart=${chart.id}&configuration=${$preferredPlayConfigurationQuery.data.data[0].id}&token=${data.data.token}&timestamp=${data.data.timestamp}`,
                                '_blank',
                              );
                            }
                          } else {
                            playOpen = true;
                          }
                        }}
                      >
                        <i class="fa-solid fa-play fa-lg"></i>
                        {$t('chart.play')}
                      </button>
                    {/if}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {#if $assets.isSuccess && ($assets.data.data.length > 0 || getUserPrivilege(user?.role) === 6)}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.assets')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body pt-14 pb-10">
              <a
                class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
                href="/charts/{id}/assets"
              >
                {$t('common.more')}
                <i class="fa-solid fa-angles-right"></i>
              </a>
              {#if $assets.data.data.length > 0}
                <div class="result">
                  {#each $assets.data.data.slice(0, 6) as chartAsset}
                    <ChartAsset {chartAsset} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
      <Comments type="charts" id={chart.id} {searchParams} />
    </div>
    <div class="w-80 form-control mx-auto lg:mx-4">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.owner')}
        </span>
        <User id={chart.ownerId} />
      </div>
      {#if $song.isSuccess}
        {@const song = $song.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
        {#if $records.isSuccess}
          {@const records = $records.data.data.slice(0, 10)}
          {#if records.length > 0}
            <div class="indicator w-full my-4">
              <span
                class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
                style:--tw-translate-x="0"
              >
                {$t('common.records')}
              </span>
              <div class="card w-80 bg-base-100 transition border-2 normal-border hover:shadow-lg">
                <div class="card-body gap-2 items-center justify-center">
                  {#each records as record}
                    <Record {record} {chart} {song} rank={record.position} showChart={false} />
                  {/each}
                </div>
              </div>
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </div>
{:else if $chart.isError}
  <Error error={$chart.error} back="/charts" />
{:else}
  <div class="min-h-page skeleton" />
{/if}

<style>
  .main-width {
    width: calc(100% - 80px);
  }
</style>
