<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { Chart, PlayRecord, Song } from '$lib/models';
  import { t } from '$lib/translations/config';
  import {
    getCompressedImage,
    getGrade,
    getLevelColor,
    getLevelDisplay,
    parseDateTime,
  } from '$lib/utils';

  $: ({ api } = $page.data);

  export let record: PlayRecord;
  export let chart: Chart | undefined = undefined;
  export let song: Song | undefined = undefined;
  export let rank: number | undefined = undefined;
  export let showChart = true;

  $: grade = getGrade(record.score, record.full_combo);

  $: chartQ = createQuery(api.chart.info({ id: record.chart.id }, { initialData: chart }));
  $: songQ = createQuery(
    api.song.info(
      { id: $chartQ.data?.song ?? 0 },
      { enabled: $chartQ.isSuccess, initialData: song }
    )
  );
  $: player = createQuery(api.user.info({ id: record.player }));
</script>

<div
  class={`card m-1 w-[288px] ${
    typeof record.player == 'object' ? 'h-40' : 'h-36'
  } card-side relative bg-base-100 shadow-lg glass overflow-hidden`}
>
  <a class="w-fit h-fit" href={`/records/${record.id}`}>
    {#if $songQ.isSuccess}
      <img
        class="object-fill w-full h-full blur opacity-40"
        src={getCompressedImage($songQ.data.illustration)}
        alt="Illustration"
      />
    {/if}
    <div
      class={`absolute left-6 text-7xl grade ${
        grade == 'P'
          ? 'top-11 text-yellow-400'
          : record.full_combo
          ? 'top-11 text-blue-400'
          : 'top-11'
      }`}
    >
      {grade}
    </div>
    <div class="absolute right-2 top-2 form-control justify-end">
      {#if showChart && $chartQ.isSuccess && $songQ.isSuccess}
        {@const chart = $chartQ.data}
        {@const song = $songQ.data}
        <div class="btn-group btn-group-horizontal w-[272px] justify-end">
          <a
            class="btn song flex-shrink btn-xs btn-outline justify-start text-sm no-animation whitespace-nowrap overflow-hidden text-ellipsis"
            href="/songs/{song.id}"
          >
            {song.name}
          </a>
          <a
            class={`btn ${getLevelColor(chart.level_type)} btn-xs text-sm no-animation`}
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
        {(record.acc * 100).toFixed(2)}%
      </p>
      <p class="text-right h-5">
        P{record.perfect} · G{record.good_early + record.good_late} · B{record.bad}
        · M{record.miss}
      </p>
    </div>
    <div class="absolute right-2 bottom-2 form-control justify-end">
      <p class="text-right player">
        {#if $player.isSuccess}
          {@const player = $player.data}
          <a href={`/users/${player.id}`} class="hover:underline">
            {$t(player.username)}
          </a>
        {/if}
        {parseDateTime(record.time)}
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
