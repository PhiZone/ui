<script lang="ts">
  import { page } from '$app/stores';
  import type { ChartDto, RecordDto } from '$lib/api';
  import {
    getCompressedImage,
    getGrade,
    getLevelColor,
    getLevelDisplay,
    parseDateTime,
  } from '$lib/utils';

  $: ({ user } = $page.data);

  export let record: RecordDto;
  export let chart: ChartDto | undefined = undefined;
  export let rank: number | undefined = undefined;
  export let showChart = true;

  let c = record.chart ?? chart;

  $: grade = getGrade(record.score, record.isFullCombo);
</script>

<div
  class="card w-[288px] h-40 card-side relative overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a class="w-full h-full glass" href={`/records/${record.id}`}>
    <img
      class="object-fill w-full h-full blur-lg opacity-40"
      src={getCompressedImage(c?.illustration ?? c?.song.illustration, 1)}
      alt="Illustration"
    />
    <div
      class={`absolute left-6 text-7xl grade ${
        grade == 'P' ? 'top-11 text-warning' : record.isFullCombo ? 'top-11 text-info' : 'top-11'
      }`}
    >
      {grade}
    </div>
    <div class="absolute right-2 top-2 form-control justify-end">
      {#if showChart}
        <div class="join join-horizontal w-[272px] justify-end">
          <a
            class="btn btn-xs border-2 btn-ghost btn-active hover:btn-outline join-item song flex-shrink justify-start text-sm no-animation truncate"
            href="/charts/{c?.id}"
          >
            {c?.title ?? c?.song.title}
          </a>
          <a
            class={`btn ${getLevelColor(c?.levelType)} btn-xs text-sm join-item no-animation`}
            href="/charts/{c?.id}"
          >
            {c?.level}
            {getLevelDisplay(c?.difficulty)}
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
      <p class="flex justify-end items-center gap-2 player">
        {#if record.owner}
          <a href={`/users/${record.ownerId}`} class="hover:underline">
            {record.owner.userName}
          </a>
          <span>·</span>
        {/if}
        <span>
          {parseDateTime(record.dateCreated, true, user?.language)}
        </span>
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
