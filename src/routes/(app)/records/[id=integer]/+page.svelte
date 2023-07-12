<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { getGrade, parseDateTime } from '$lib/utils';
  import User from '$lib/components/User.svelte';
  import Chart from '$lib/components/Chart.svelte';

  export let data;
  $: ({ id, api } = data);

  $: record = createQuery(api.record.info({ id }));
  $: chart = createQuery(
    api.chart.info({ id: $record.data?.chart.id ?? 0 }, { enabled: $record.isSuccess })
  );
</script>

<svelte:head>
  <title>{$t('record.record')} | {$t('common.title')}</title>
</svelte:head>

{#if $record.isSuccess}
  {@const record = $record.data}
  {@const grade = getGrade(record.score, record.full_combo)}
  <div class="info-page">
    <div class="mx-4 min-w-fit max-w-xl main-width">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('record.record')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body py-10">
            <div class="text-5xl py-1 flex gap-5 items-center font-bold">
              {record.score}
              <div
                class={`text-8xl font-normal grade ${
                  grade == 'P'
                    ? 'top-11 text-yellow-400'
                    : record.full_combo
                    ? 'top-11 text-blue-400'
                    : 'top-11'
                }`}
              >
                {grade}
              </div>
            </div>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.acc')}</span>
              {(record.acc * 100).toFixed(2)}%
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.perfect')}</span>
              {record.perfect}
              <span class="opacity-70">
                (±{record.perfect_judgment}ms)
              </span>
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.good')}</span>
              {record.good_early + record.good_late} [E{record.good_early} · L{record.good_late}]
              <span class="opacity-70">
                (±{record.good_judgment}ms)
              </span>
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.bad')}</span>
              {record.bad}
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.miss')}</span>
              {record.miss}
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.rks')}</span>
              {record.rks.toFixed(3)}
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('record.time')}</span>
              {parseDateTime(record.time)}
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="mx-4 w-80 form-control">
      <div class="indicator my-4 w-full">
        <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
          {$t('record.player')}
        </span>
        <User id={record.player} />
      </div>
      {#if $chart.isSuccess}
        <div class="indicator my-4 w-full">
          <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
            {$t('chart.chart')}
          </span>
          <Chart chart={$chart.data} />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .grade {
    font-family: 'Black Ops One', cursive;
  }
  .main-width {
    width: calc(100% - 80px);
  }
</style>
