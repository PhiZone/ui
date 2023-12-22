<script lang="ts">
  import { Radar } from 'svelte-chartjs';
  import {
    Chart as ChartJS,
    PointElement,
    LineElement,
    RadialLinearScale,
    Tooltip,
    Filler,
  } from 'chart.js';
  import { t } from '$lib/translations/config';
  import type { ChartDto } from '$lib/api';

  export let chart: ChartDto;

  $: data = {
    labels: [
      $t('chart.arrangement'),
      $t('chart.gameplay'),
      $t('chart.vfx'),
      $t('chart.creativity'),
      $t('chart.concord'),
      $t('chart.impression'),
    ],
    datasets: [
      {
        label: `${$t('chart.rating')}`,
        data: [
          chart.ratingOnArrangement,
          chart.ratingOnGameplay,
          chart.ratingOnVisualEffects,
          chart.ratingOnCreativity,
          chart.ratingOnConcord,
          chart.ratingOnImpression,
        ],
        backgroundColor: ['rgba(238, 129, 195, 0.25)'],
        borderColor: ['rgb(238, 129, 195)'],
        borderRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  ChartJS.register(PointElement, LineElement, RadialLinearScale, Tooltip, Filler);
  ChartJS.defaults.font.family = "'Outfit', 'Noto Sans SC', sans-serif";
  ChartJS.defaults.font.size = 14;
  ChartJS.defaults.borderColor = 'rgba(150, 150, 150, 0.5)';
  ChartJS.defaults.color = 'rgb(150, 150, 150)';
</script>

<Radar
  {data}
  options={{
    scales: {
      r: { beginAtZero: true, suggestedMax: 5, ticks: { backdropColor: 'rgba(0, 0, 0, 0)' } },
    },
  }}
/>
