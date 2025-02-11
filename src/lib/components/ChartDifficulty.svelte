<script lang="ts">
  import type { ChartDto, ChartSubmissionDto } from '$lib/api';

  import { t } from '$lib/translations/config';
  import { getLevelColor, getLevelDisplay } from '$lib/utils';

  export let chart: ChartDto | ChartSubmissionDto;
  export let large = false;
  export let inline = false;
  export let css = '';
</script>

<div
  class="join items-center {large
    ? 'join-vertical md:join-horizontal min-w-fit'
    : 'join-horizontal'} {css}"
>
  <button
    class={`btn ${getLevelColor(chart.levelType)} join-item ${
      large ? 'text-3xl cursor-default' : !inline ? 'btn-sm text-xl' : 'btn-sm text-lg'
    } no-animation`}
  >
    {chart.level}
    {getLevelDisplay(chart.difficulty)}
  </button>
  {#if chart.isRanked}
    <button
      class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg join-item {large
        ? 'text-3xl cursor-default'
        : !inline
          ? 'btn-sm text-xl'
          : 'btn-sm text-lg'} no-animation"
    >
      {$t('chart.ranked')}
    </button>
  {/if}
</div>
