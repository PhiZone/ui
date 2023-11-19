<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { enhance } from '$app/forms';
  import { t } from '$lib/translations/config';
  import { getLevelColor, getLevelDisplay, getUserLevel, parseDateTime } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import { Status } from '$lib/constants';
  import Song from '$lib/components/Song.svelte';
  import User from '$lib/components/User.svelte';
  import Like from '$lib/components/Like.svelte';
  import Record from '$lib/components/Record.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import ChartRadar from '$lib/components/ChartRadar.svelte';
  import Rating from '$lib/components/Rating.svelte';

  export let data, form;
  $: ({ searchParams, id, user, api, queryClient } = data);

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

  let status = Status.WAITING;
  let arrangement = 0;
  let feel = 0;
  let vfx = 0;
  let creativity = 0;
  let concord = 0;
  let impression = 0;
  let open = false;

  $: chart = createQuery(api.chart.info({ id }));
  $: song = createQuery(
    api.song.info({ id: $chart.data?.data.songId ?? '' }, { enabled: $chart.isSuccess }),
  );
  $: records = createQuery(
    api.record.listChart({ chartId: id, order: ['rks', 'dateCreated'], desc: [true, true] }),
  );
  $: votes = createQuery(api.vote.listAll({ chartId: id }));
  $: charter = richtext($chart.data?.data.authorName ?? '');
</script>

<!-- {#if $chart.isSuccess}
  {$chart.data.id}
  {#if $song.isSuccess}
    {$song.data.id}
  {/if}
{/if} -->

<svelte:head>
  <title>
    {$t('chart.chart')} -
    {$chart.data
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
    <input type="checkbox" id="chart-vote" class="modal-toggle" bind:checked={open} />
    <div class="modal">
      <div class="modal-box bg-base-100 min-w-fit w-[50vw] max-w-[1200px]">
        <label
          for="chart-vote"
          class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
        >
          ✕
        </label>
        <h2 class="font-bold text-xl mb-4">{$t('common.vote')}</h2>
        <form
          class="form-control"
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
                open = false;
              }
              await update();
            };
          }}
        >
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
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
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.feel')}
            </span>
            <div class="w-[70%]">
              <input
                id="feel"
                name="feel"
                type="range"
                min="0"
                max="5"
                bind:value={feel}
                class="range"
                step="1"
              />
            </div>
            <p class="text-xl font-bold w-[5%] text-center">{feel}</p>
          </div>
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
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
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
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
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
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
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
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
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.multiplier')}
            </span>
            <p class="text-xl font-bold w-3/4">
              {getMultiplier(getUserLevel(user.experience)).toFixed(1)}
            </p>
          </div>
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.score')}
            </span>
            <p class="text-xl font-bold w-3/4">
              {(
                (arrangement + feel + vfx + creativity + concord + impression) *
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
                  : 'btn-secondary btn-outline'} w-full"
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
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.chart')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex-col sm:flex-row gap-4 items-center">
              <h2 class="text-5xl font-bold content md:inline-block">
                {$song.data?.data.title}
              </h2>
              <div class="join join-vertical md:join-horizontal mt-2 md:mt-0 md:ml-2 min-w-fit">
                <button
                  class="btn {getLevelColor(chart.levelType)} join-item text-3xl no-animation"
                >
                  {chart.level}
                  {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
                </button>
                {#if chart.isRanked}
                  <button class="btn btn-success join-item text-3xl no-animation">
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
                <div class="justify-center join join-vertical md:join-horizontal">
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
                      ? 'btn-primary'
                      : 'btn-disabled'} btn-outline join-item flex gap-1"
                  >
                    <i class="fa-solid fa-check-to-slot fa-lg"></i>
                    {$t('common.vote')}
                  </label>
                  {#if chart.file && user}
                    <a
                      href={chart.file}
                      target="_blank"
                      rel="noreferrer"
                      download={chart.file.split('/').pop()}
                      class="btn btn-primary btn-outline join-item flex gap-1"
                    >
                      <i class="fa-solid fa-file-arrow-down fa-lg"></i>
                      {$t('common.download')}
                    </a>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Comments type="charts" id={chart.id} {searchParams} />
    </div>
    <div class="w-80 form-control mx-auto lg:mx-4">
      <div class="indicator my-4 w-full">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.owner')}
        </span>
        <User id={chart.ownerId} />
      </div>
      {#if $song.isSuccess}
        {@const song = $song.data.data}
        <div class="indicator my-4 w-full">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
        {#if $records.isSuccess}
          {@const records = $records.data.data.slice(0, 10)}
          {#if records.length > 0}
            <div class="indicator my-4 w-full">
              <span
                class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
                style:--tw-translate-x="0"
              >
                {$t('common.records')}
              </span>
              <div class="card w-80 bg-base-100 shadow-lg">
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
{/if}

<style>
  .main-width {
    width: calc(100% - 80px);
  }
</style>
