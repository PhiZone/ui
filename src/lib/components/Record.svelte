<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { ChartDto, RecordDto, SongDto } from '$lib/models';
  import { t } from '$lib/translations/config';
  import { getGrade, getLevelColor, getLevelDisplay, parseDateTime } from '$lib/utils';

  $: ({ api } = $page.data);

  export let record: RecordDto;
  export let chart: ChartDto | undefined = undefined;
  export let song: SongDto | undefined = undefined;
  export let rank: number | undefined = undefined;
  export let showChart = true;

  $: grade = getGrade(record.score, record.isFullCombo);

  $: chartQ = createQuery(
    api.chart.info({ id: record.chartId }, { enabled: !chart, initialData: chart }),
  );
  $: songQ = createQuery(
    api.song.info(
      { id: chart ? chart.songId : $chartQ.data?.data.songId ?? 0 },
      { enabled: $chartQ.isSuccess && !song, initialData: song },
    ),
  );
  $: player = createQuery(api.user.info({ id: record.ownerId }));
</script>

<div
  class={'card m-1 w-[288px] h-40 card-side relative bg-base-100 shadow-lg glass overflow-hidden'}
>
  <a class="w-fit h-fit" href={`/records/${record.id}`}>
    {#if $songQ.isSuccess}
      <img
        class="object-fill w-full h-full blur opacity-40"
        src={$songQ.data.data.illustration}
        alt="Illustration"
      />
    {/if}
    <div
      class={`absolute left-6 text-7xl grade ${
        grade == 'P'
          ? 'top-11 text-yellow-400'
          : record.isFullCombo
          ? 'top-11 text-blue-400'
          : 'top-11'
      }`}
    >
      {grade}
    </div>
    <div class="absolute right-2 top-2 form-control justify-end">
      {#if showChart && $chartQ.isSuccess && $songQ.isSuccess}
        {@const chart = $chartQ.data.data}
        {@const song = $songQ.data.data}
        <div class="btn-group btn-group-horizontal w-[272px] justify-end">
          <a
            class="btn song flex-shrink btn-xs btn-outline justify-start text-sm no-animation whitespace-nowrap overflow-hidden text-ellipsis"
            href="/songs/{song.id}"
          >
            {song.title}
          </a>
          <a
            class={`btn ${getLevelColor(chart.levelType)} btn-xs text-sm no-animation`}
            href="/charts/{chart.id}"
          >
            {chart.level}
            {getLevelDisplay(chart.difficulty)}
          </a>
        </div>
      {:else if rank}
        <div class="btn-group btn-group-horizontal w-[272px] justify-start">
          <button class="btn btn-secondary btn-xs text-sm no-animation">
            #{rank}
          </button>
        </div>
      {/if}
      <h2 class="mt-1 font-bold text-3xl h-8 text-right">
        {record.score}
      </h2>
      <p class="text-xl h-[26px] text-right">
        {(record.accuracy * 100).toFixed(2)}%
      </p>
      <p class="text-right h-5">
        P{record.perfect} · G{record.goodEarly + record.goodLate} · B{record.bad}
        · M{record.miss}
      </p>
    </div>
    <div class="absolute right-2 bottom-2 form-control justify-end">
      <p class="text-right player">
        {#if $player.isSuccess}
          {@const player = $player.data.data}
          <a href={`/users/${player.id}`} class="hover:underline">
            {$t(player.userName)}
          </a>
        {/if}
        {parseDateTime(record.dateCreated)}
      </p>
    </div>
  </a>
</div>

<style>
  .song {
    text-transform: none;
  }
  .grade {
    font-family: 'Black Ops One', cursive;
  }
  .player {
    line-height: 16px;
  }
</style>
