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
  import type { Chart } from '$lib/models';

  export let chart: Chart;

  $: data = {
    labels: [
      $t('chart.arrangement'),
      $t('chart.feel'),
      $t('chart.vfx'),
      $t('chart.innovativeness'),
      $t('chart.concord'),
      $t('chart.impression'),
    ],
    datasets: [
      {
        label: `${$t('chart.rating')}`,
        data: [
          chart.r_arrangement,
          chart.r_feel,
          chart.r_vfx,
          chart.r_innovativeness,
          chart.r_concord,
          chart.r_impression,
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
</script>

<Radar {data} options={{ scales: { r: { beginAtZero: true } } }} />
