<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { getGrade, parseDateTime } from '$lib/utils';
  import User from '$lib/components/User.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import Like from '$lib/components/Like.svelte';

  export let data;
  $: ({ searchParams, id, api } = data);

  $: record = createQuery(api.record.info({ id }));
  $: chart = createQuery(
    api.chart.info({ id: $record.data?.data.chartId ?? '' }, { enabled: $record.isSuccess }),
  );
</script>

<svelte:head>
  <title>{$t('record.record')} | {$t('common.title')}</title>
</svelte:head>

{#if $record.isSuccess}
  {@const record = $record.data.data}
  {@const grade = getGrade(record.score, record.isFullCombo)}
  <div class="info-page">
    <div class="mx-auto lg:mx-4 min-w-fit w-[40vw]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('record.record')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="text-5xl py-1 flex gap-5 items-center font-bold">
              {record.score}
              <div
                class={`text-8xl font-normal grade ${
                  grade == 'P'
                    ? 'top-11 text-yellow-400'
                    : record.isFullCombo
                      ? 'top-11 text-blue-400'
                      : 'top-11'
                }`}
              >
                {grade}
              </div>
            </div>
            <p>
              <span class="badge mr-1">{$t('record.acc')}</span>
              {(record.accuracy * 100).toFixed(2)}%
            </p>
            <p>
              <span class="badge mr-1">{$t('record.perfect')}</span>
              {record.perfect}
              <span class="opacity-70">
                (± {record.perfectJudgment} ms)
              </span>
            </p>
            <p>
              <span class="badge mr-1">{$t('record.good')}</span>
              {record.goodEarly + record.goodLate} [E{record.goodEarly} · L{record.goodLate}]
              <span class="opacity-70">
                (± {record.goodJudgment} ms)
              </span>
            </p>
            <p>
              <span class="badge mr-1">{$t('record.bad')}</span>
              {record.bad}
            </p>
            <p>
              <span class="badge mr-1">{$t('record.miss')}</span>
              {record.miss}
            </p>
            <p>
              <span class="badge mr-1">{$t('record.rks')}</span>
              {record.rks.toFixed(3)}
            </p>
            <p>
              <span class="badge mr-1">
                {$t('record.std_deviation')}
              </span>
              {record.stdDeviation.toFixed(3)} ms
            </p>
            <p>
              <span class="badge mr-1">{$t('record.time')}</span>
              {parseDateTime(record.dateCreated)}
            </p>
            <div class="card-actions justify-end">
              <Like
                id={record.id}
                likes={record.likeCount}
                type="records"
                liked={record.dateLiked != null}
                class="card-action btn-md w-36 text-lg"
              />
            </div>
          </div>
        </div>
      </div>
      <Comments type="records" id={record.id} {searchParams} />
    </div>
    <div class="w-80 form-control mx-auto lg:mx-4">
      <div class="indicator my-4 w-full">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('record.player')}
        </span>
        <User id={record.ownerId} />
      </div>
      {#if $chart.isSuccess}
        <div class="indicator my-4 w-full">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.chart')}
          </span>
          <Chart chart={$chart.data.data} />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .grade {
    font-family: 'Black Ops One', cursive;
  }
</style>
