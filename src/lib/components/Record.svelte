<script lang="ts">
  import type { ChartDto, RecordDto } from '$lib/api';

  import { page } from '$app/state';
  import {
    getCompressedImage,
    getGrade,
    getLevelColor,
    getLevelDisplay,
    parseDateTime,
  } from '$lib/utils';

  let { user } = $derived(page.data);

  interface Props {
    record: RecordDto;
    chart?: ChartDto;
    rank?: number;
    showChart?: boolean;
  }
  let { record, chart, rank, showChart = true }: Props = $props();

  let c = $derived(record.chart ?? chart);
  let grade = $derived(getGrade(record.score, record.isFullCombo));
</script>

<div
  class="card record-glass w-[288px] h-40 card-side relative overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a class="absolute z-10 top-0 left-0 right-0 bottom-0" href={`/records/${record.id}`}>{''}</a>
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
      <a class="z-20 join join-horizontal w-[272px] justify-end" href="/charts/{c?.id}">
        <div
          class="btn btn-xs border-2 btn-ghost btn-active hover:btn-outline join-item song flex-shrink justify-start text-sm no-animation truncate"
        >
          {c?.title ?? c?.song.title}
        </div>
        <div class={`btn ${getLevelColor(c?.levelType)} btn-xs text-sm join-item no-animation`}>
          {c?.level}
          {getLevelDisplay(c?.difficulty)}
        </div>
      </a>
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
    <p class="text-xl h-[26px] opacity-90 text-right">
      {(record.accuracy * 100).toFixed(2)}%
    </p>
    <p class="h-5 opacity-60 text-right">
      P{record.perfect} · G{record.goodEarly + record.goodLate} · B{record.bad}
      · M{record.miss}
    </p>
  </div>
  <div class="absolute right-2 bottom-2 form-control justify-end">
    <p class="flex justify-end items-center gap-2 player">
      {#if record.owner}
        <a href={`/users/${record.ownerId}`} class="z-20 hover:underline">
          {record.owner.userName}
        </a>
        <span class="opacity-60">·</span>
      {/if}
      <span>
        {parseDateTime(record.dateCreated, true, user?.language)}
      </span>
    </p>
  </div>
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
  .record-glass {
    backdrop-filter: blur(var(--glass-blur, 40px));
    background-color: transparent;
    background-image: linear-gradient(
        135deg,
        rgb(255 255 255 / var(--glass-opacity, 30%)) 0%,
        rgb(0 0 0 / 0%) 100%
      ),
      linear-gradient(
        var(--glass-reflex-degree, 100deg),
        rgb(255 255 255 / var(--glass-reflex-opacity, 10%)) 25%,
        rgb(0 0 0 / 0%) 25%
      );
    box-shadow:
      0 0 0 1px rgb(255 255 255 / var(--glass-border-opacity, 10%)) /* #ffffff */ inset,
      0 0 0 2px rgb(0 0 0 / 5%);
    text-shadow: 0 1px rgb(0 0 0 / var(--glass-text-shadow-opacity, 5%)) /* #000000 */;
  }
</style>
