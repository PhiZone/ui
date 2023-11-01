<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { ChartDto, RecordDto, SongDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import {
    getCompressedImage,
    getGrade,
    getLevelColor,
    getLevelDisplay,
    parseDateTime,
  } from '$lib/utils';

  $: ({ api } = $page.data);

  export let record: RecordDto;
  export let chart: ChartDto | undefined = undefined;
  export let song: SongDto | undefined = undefined;
  export let rank: number | undefined = undefined;
  export let showChart = true;

  $: grade = getGrade(record.score, record.isFullCombo);

  $: chartQ = createQuery(api.chart.info({ id: record.chartId }, { enabled: !chart }));
  $: songQ = createQuery(
    api.song.info(
      { id: chart ? chart.songId : $chartQ.data?.data.songId ?? '' },
      { enabled: $chartQ.isSuccess && !song },
    ),
  );
  $: player = createQuery(api.user.info({ id: record.ownerId }));
</script>

<div
  class={'card m-1 w-[288px] h-40 card-side relative overflow-hidden transition border-2 border-gray-700 hover:border-primary hover:shadow-lg'}
>
  <a class="w-full h-full glass" href={`/records/${record.id}`}>
    {#if $songQ.isSuccess}
      <img
        class="object-fill w-full h-full blur-lg opacity-40"
        src={getCompressedImage($songQ.data.data.illustration, 1)}
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
        <div class="join join-horizontal w-[272px] justify-end">
          <a
            class="btn btn-xs btn-outline join-item song flex-shrink justify-start text-sm no-animation whitespace-nowrap overflow-hidden text-ellipsis"
            href="/songs/{song.id}"
          >
            {song.title}
          </a>
          <a
            class={`btn ${getLevelColor(chart.levelType)} btn-xs text-sm join-item no-animation`}
            href="/charts/{chart.id}"
          >
            {chart.level}
            {getLevelDisplay(chart.difficulty)}
          </a>
        </div>
      {:else if rank}
        <div class="join join-horizontal w-[272px] justify-start">
          <button class="btn btn-secondary btn-xs join-item text-sm no-animation">
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
