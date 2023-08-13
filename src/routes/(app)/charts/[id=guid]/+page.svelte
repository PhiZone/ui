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

  export let data;
  $: ({ searchParams, id, user, api } = data);

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

  export let form;

  $: chart = createQuery(api.chart.info({ id }));
  $: song = createQuery(
    api.song.info({ id: $chart.data?.data.songId ?? '' }, { enabled: $chart.isSuccess }),
  );
  $: records = createQuery(api.record.list({ rangeChartId: [id], order: 'rks', desc: true }));
  $: votes = createQuery(api.vote.listAll({ id }));

  $: charter = richtext($chart.data?.data.authorName ?? '', api);
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
      ? `[${$chart.data.data.title ?? $song.data?.data.title} ${
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
                status = Status.SENDING;
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
              {getMultiplier(getUserLevel(user.exp)).toFixed(1)}
            </p>
          </div>
          <div class="flex gap-3">
            <span class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit">
              {$t('chart.score')}
            </span>
            <p class="text-xl font-bold w-3/4">
              {(
                (arrangement + feel + vfx + creativity + concord + impression) *
                getMultiplier(getUserLevel(user.exp))
              ).toFixed(2)}
            </p>
          </div>
          <div class="modal-action">
            <div
              class="tooltip tooltip-top tooltip-error w-full"
              class:tooltip-open={status === Status.ERROR}
              data-tip={status === Status.ERROR ? form?.detail ?? $t('common.unknown_error') : null}
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
    <div class="mx-4 min-w-[540px] max-w-7xl main-width">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('chart.chart')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body py-10">
            <div class="text-5xl py-3 flex font-bold items-center">
              {$song.data?.data.title}
              <div class="ml-2 min-w-fit flex gap-1 align-middle">
                <div class="join join-horizontal">
                  <button
                    class="btn {getLevelColor(
                      chart.levelType,
                    )} btn-sm join-item text-2xl no-animation"
                  >
                    {chart.level}
                    {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
                  </button>
                  {#if chart.isRanked}
                    <button class="btn btn-primary btn-sm join-item text-2xl no-animation">
                      {$t('chart.ranked')}
                    </button>
                  {/if}
                </div>
              </div>
            </div>
            <div class="flex">
              <div class="w-1/2">
                <!-- <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.id')}</span>
                  {chart.id}
                </p> -->
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.level')}</span>
                  {chart.level}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('chart.difficulty')}
                  </span>
                  {chart.difficulty.toFixed(1)}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.charter')}</span>
                  {#if chart.authorName}
                    {@html $charter}
                  {:else}
                    {$t('common.anonymous')}
                  {/if}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.notes')}</span>
                  {chart.noteCount}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.format')}</span>
                  {$t(`chart.formats.${chart.format}`)}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.score')}</span>
                  {chart.score.toFixed(2)}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.rating')}</span>
                  {chart.rating.toFixed(2)}
                </p>
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('chart.equivalent_vote_count')}
                  </span>
                  {chart.rating > 0 ? (chart.score / chart.rating).toFixed(2) : 0}
                </p>
                {#if $votes.isSuccess}
                  <p>
                    <span class="badge badge-primary badge-outline mr-1">
                      {$t('chart.real_vote_count')}
                    </span>
                    {$votes.data?.total}
                  </p>
                {/if}
                <p>
                  <span class="badge badge-primary badge-outline mr-1">{$t('chart.time')}</span>
                  {parseDateTime(chart.dateCreated)}
                </p>
                {#if chart.description}
                  <p class="content">
                    <span class="badge badge-primary badge-outline mr-1">
                      {$t('common.description')}
                    </span>
                    {chart.description}
                  </p>
                {/if}
              </div>
              <div class="divider divider-horizontal" />
              <div class="w-1/2 float-right p-4 form-control gap-3">
                <ChartRadar {chart} />
                <div class="flex justify-center gap-2">
                  <Like id={chart.id} likes={chart.likeCount} type="charts" class="btn-md" />
                  <label
                    for="chart-vote"
                    class="btn {user ? 'btn-primary' : 'btn-disabled'} btn-outline flex gap-1"
                  >
                    <svg
                      fill="currentColor"
                      width="16px"
                      height="26px"
                      viewBox="0 0 18 32"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M13.52 5.72h-7.4c-0.36 0-0.56 0.2-0.6 0.24l-5.28 5.28c-0.040 0.040-0.24 0.24-0.24 0.56v12.2c0 1.24 1 2.24 2.24 2.24h11.24c1.24 0 2.24-1 2.24-2.24v-16.040c0.040-1.24-0.96-2.24-2.2-2.24zM5.28 8.56v1.8c0 0.32-0.24 0.56-0.56 0.56h-1.84l2.4-2.36zM14.080 24.040c0 0.32-0.28 0.56-0.56 0.56h-11.28c-0.32 0-0.56-0.28-0.56-0.56v-11.36h3.040c1.24 0 2.24-1 2.24-2.24v-3.040h6.52c0.32 0 0.56 0.24 0.56 0.56l0.040 16.080z"
                      />
                    </svg>
                    {$t('common.vote')}
                  </label>
                  {#if chart.file && user}
                    <a href={chart.file} target="_blank" rel="noreferrer" download>
                      <button class="btn btn-primary btn-outline flex gap-1 min-w-fit">
                        <svg
                          fill="currentColor"
                          width="14px"
                          height="28px"
                          viewBox="0 0 16 32"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.48 17.6c-0.48 0-0.84 0.36-0.84 0.84v3.92c0 0.48-0.36 0.84-0.84 0.84h-9.28c-0.48 0-0.84-0.36-0.84-0.84v-3.92c0-0.44-0.36-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v3.92c0 1.4 1.12 2.52 2.52 2.52h9.28c1.4 0 2.52-1.12 2.52-2.52v-3.92c0-0.44-0.36-0.84-0.84-0.84zM6.56 18.48c0.040 0.040 0.2 0.28 0.6 0.28s0.56-0.24 0.6-0.28l3.52-3.52c0.32-0.32 0.32-0.84 0-1.2-0.32-0.32-0.84-0.32-1.2 0l-2.080 2.12v-7.92c0-0.48-0.36-0.84-0.84-0.84s-0.84 0.36-0.84 0.84v7.92l-2.080-2.080c-0.32-0.32-0.84-0.32-1.2 0-0.32 0.32-0.32 0.84 0 1.2l3.52 3.48z"
                          />
                        </svg>
                        {$t('common.download')}
                      </button>
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
    <div class="mx-4 w-80 form-control">
      {#if chart.ownerId}
        <div class="indicator my-4 w-full">
          <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
            {$t('chart.owner')}
          </span>
          <User id={chart.ownerId} />
        </div>
      {/if}
      {#if $song.isSuccess}
        {@const song = $song.data.data}
        <div class="indicator my-4 w-full">
          <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
        {#if $records.isSuccess}
          {@const records = $records.data.data.slice(0, 10)}
          {#if records.length > 0}
            <div class="indicator my-4 w-full">
              <span
                class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
              >
                {$t('common.records')}
              </span>
              <div class="card w-80 bg-base-100 shadow-lg overflow-hidden">
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
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }

  .main-width {
    width: calc(100% - 80px);
  }
</style>
