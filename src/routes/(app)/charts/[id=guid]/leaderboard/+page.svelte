<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import { goto, preloadData } from '$app/navigation';
  import ChartLabel from '$lib/components/ChartDifficulty.svelte';
  import Region from '$lib/components/Region.svelte';
  import { t } from '$lib/translations/config';
  import { getAvatar, getLevelDisplay, parseDateTime } from '$lib/utils';

  export let data;
  const { searchParams, id, user, api } = data;

  $: chartQuery = createQuery(api.chart.info({ id }));
  $: leaderboardQuery = createQuery(api.chart.leaderboard({ id, ...searchParams }));
</script>

<svelte:head>
  <title>
    {$t('common.leaderboard')} | {$t('chart.chart')} -
    {$chartQuery.isSuccess
      ? `${$chartQuery.data.data.title ?? $chartQuery.data.data.song.title} [${
          $chartQuery.data.data.level
        } ${getLevelDisplay($chartQuery.data.data.difficulty)}]`
      : ''}
    | {$t('common.site_name')}
  </title>
</svelte:head>
{#if $leaderboardQuery.isSuccess && $chartQuery.isSuccess}
  {@const leaderboard = $leaderboardQuery.data.data}
  {@const chart = $chartQuery.data.data}
  <div
    class="background min-h-screen"
    style:background-image="url({chart.illustration ?? chart.song.illustration})"
  >
    <div
      class="hero-overlay bg-fixed bg-opacity-40 bg-gradient-to-t from-base-300 to-transparent"
    ></div>
    <div class="pt-32 pb-24 w-full flex flex-col max-w px-4 md:px-16 2xl:px-32 mx-auto">
      <div class="flex justify-between">
        <div class="mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <h2 class="text-5xl font-bold content md:inline-block">
            {chart.title ?? chart.song.title}
          </h2>
          <ChartLabel {chart} large />
        </div>
        <a
          href="/charts/{id}"
          class="btn border-2 normal-border hover:btn-outline join-item bg-opacity-40 backdrop-blur-lg"
        >
          {$t('common.back')}
        </a>
      </div>
      <div>
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.leaderboard')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100 bg-opacity-40 backdrop-blur-lg"
          >
            <div class="card-body py-10">
              <div class="overflow-x-auto">
                <table class="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>{$t('record.player')}</th>
                      <th>{$t('common.score')}</th>
                      <th>{$t('record.accuracy')}</th>
                      <th>{$t('record.perfect')}</th>
                      <th>{$t('record.good')}</th>
                      <th>{$t('record.bad')}</th>
                      <th>{$t('record.miss')}</th>
                      <th>{$t('record.rks')}</th>
                      <th>{$t('record.std_deviation')}</th>
                      <th>{$t('record.date_played')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each leaderboard as record}
                      <tr
                        class="transition bg-opacity-25 {record.ownerId === user?.id
                          ? 'bg-info-content'
                          : 'bg-base-100'} hover:bg-opacity-75 hover:cursor-pointer"
                        on:click={() => {
                          goto(`/records/${record.id}`);
                        }}
                        on:mouseenter={() => {
                          preloadData(`/records/${record.id}`);
                        }}
                      >
                        <td>{record.position}</td>
                        <td>
                          <a
                            href="/users/{record.ownerId}"
                            class="flex items-center gap-3 hover:underline"
                          >
                            <div class="avatar">
                              <div class="mask mask-circle w-12 h-12">
                                <img src={getAvatar(record.owner?.avatar)} alt="Avatar" />
                              </div>
                            </div>
                            <div>
                              <div class="font-bold">
                                {record.owner?.userName ?? $t('common.anonymous')}
                              </div>
                              <Region
                                region={record.owner?.region}
                                width={21}
                                textCss="opacity-50"
                              />
                            </div>
                          </a>
                        </td>
                        <th class="text-lg">
                          {record.score}
                        </th>
                        <td>{(record.accuracy * 100).toFixed(2)}%</td>
                        <td class="whitespace-nowrap">
                          {record.perfect}
                          <br />
                          <span class="opacity-70">
                            (± {record.perfectJudgment} ms)
                          </span>
                        </td>
                        <td class="whitespace-nowrap">
                          {record.goodEarly + record.goodLate}
                          <span class="opacity-70">[E{record.goodEarly} · L{record.goodLate}]</span>
                          <br />
                          <span class="opacity-70">
                            (± {record.goodJudgment} ms)
                          </span>
                        </td>
                        <td class="whitespace-nowrap">
                          {record.bad}
                          <br />
                          <span class="opacity-70">
                            (± {record.goodJudgment * 1.125} ms)
                          </span>
                        </td>
                        <td>{record.miss}</td>
                        <th>{record.rks.toFixed(3)}</th>
                        <td>
                          {record.stdDeviation.toFixed(3)} ms
                        </td>
                        <td>{parseDateTime(record.dateCreated)}</td>
                      </tr>
                    {/each}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>#</th>
                      <th>{$t('record.player')}</th>
                      <th>{$t('common.score')}</th>
                      <th>{$t('record.accuracy')}</th>
                      <th>{$t('record.perfect')}</th>
                      <th>{$t('record.good')}</th>
                      <th>{$t('record.bad')}</th>
                      <th>{$t('record.miss')}</th>
                      <th>{$t('record.rks')}</th>
                      <th>{$t('record.std_deviation')}</th>
                      <th>{$t('record.date_played')}</th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .max-w {
    max-width: min(calc(100vw - 16px), 1600px);
  }
</style>
