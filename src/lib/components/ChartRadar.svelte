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
  import type { ChartDto } from '$lib/models';

  export let chart: ChartDto;

  $: data = {
    labels: [
      $t('chart.arrangement'),
      $t('chart.feel'),
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
          chart.ratingOnFeel,
          chart.ratingOnVisualEffects,
          chart.ratingOnCreativity,
          chart.ratingOnConcord,
          chart.ratingOnImpression,
        ],
        backgroundColor: ['rgba(255, 155, 132, 0.2)'],
        borderColor: ['rgba(255, 99, 132, 1)'],
        borderRadius: 4,
        borderWidth: 2,
      },
    ],
  };

  ChartJS.register(PointElement, LineElement, RadialLinearScale, Tooltip, Filler);
  ChartJS.defaults.font.family = "'Saira', sans-serif";
  ChartJS.defaults.font.size = 12;
  ChartJS.defaults.borderColor = 'rgba(127, 99, 132, 0.5)';
  ChartJS.defaults.color = 'rgb(127, 99, 132)';
</script>

<Radar
  {data}
  options={{
    scales: {
      r: { beginAtZero: true, suggestedMax: 5, ticks: { backdropColor: 'rgba(0, 0, 0, 0)' } },
    },
  }}
/>
