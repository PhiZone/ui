<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import AnonymizationNotice from '$lib/components/AnonymizationNotice.svelte';
  import Application from '$lib/components/Application.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';
  import Like from '$lib/components/Like.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';
  import { getGrade, parseDateTime } from '$lib/utils';

  let { data } = $props();
  let { searchParams, id, api } = $derived(data);

  let recordQuery = $derived(createQuery(api.record.info({ id })));
  let chart = $derived(
    createQuery(
      api.chart.info(
        { id: $recordQuery.data?.data.chartId ?? '' },
        { enabled: $recordQuery.isSuccess },
      ),
    ),
  );
  let application = $derived(
    createQuery(
      api.application.info(
        { id: $recordQuery.data?.data.applicationId ?? '' },
        { enabled: $recordQuery.isSuccess },
      ),
    ),
  );
</script>

<svelte:head>
  <title>{$t('record.record')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $recordQuery.isSuccess}
  {@const record = $recordQuery.data.data}
  {@const grade = getGrade(record.score, record.isFullCombo)}
  <div class="info-page">
    <div class="mx-auto lg:mx-4 min-w-fit w-[40vw]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('record.record')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <h1 class="py-1 flex gap-5 items-center">
              <span class="text-5xl font-bold">{record.score}</span>
              <span
                class={`text-8xl font-normal grade ${
                  grade == 'P'
                    ? 'top-11 text-warning'
                    : record.isFullCombo
                      ? 'top-11 text-info'
                      : 'top-11'
                }`}
              >
                {grade}
              </span>
            </h1>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.accuracy')}</span>
              <span>{(record.accuracy * 100).toFixed(2)}%</span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.perfect')}</span>
              <span>{record.perfect}</span>
              <span class="opacity-70">
                (± {record.perfectJudgment} ms)
              </span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.good')}</span>
              <span>
                {record.goodEarly + record.goodLate} [E{record.goodEarly} · L{record.goodLate}]
              </span>
              <span class="opacity-70">
                (± {record.goodJudgment} ms)
              </span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.bad')}</span>
              <span>{record.bad}</span>
              <span class="opacity-70">
                (± {record.goodJudgment * 1.125} ms)
              </span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.miss')}</span>
              <span>{record.miss}</span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.rks')}</span>
              <span>{record.rks.toFixed(3)}</span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">
                {$t('record.std_deviation')}
              </span>
              <span>
                {typeof record.stdDeviation === 'number' ? record.stdDeviation.toFixed(3) : '∞'} ms
              </span>
            </p>
            <p class="flex gap-1 items-center">
              <span class="badge">{$t('record.date_played')}</span>
              <span>{parseDateTime(record.dateCreated)}</span>
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
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('record.player')}
        </span>
        {#if record.ownerId}
          <User id={record.ownerId} />
        {:else}
          <AnonymizationNotice />
        {/if}
      </div>
      {#if $chart.isSuccess}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.chart')}
          </span>
          <Chart chart={$chart.data.data} />
        </div>
      {/if}
      {#if $application.isSuccess}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('application.application')}
          </span>
          <Application application={$application.data.data} fixedHeight={false} />
        </div>
      {/if}
    </div>
  </div>
{:else if $recordQuery.isError}
  <Error error={$recordQuery.error} back="/records" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}

<style>
  .grade {
    font-family: 'Black Ops One', cursive;
  }
</style>
