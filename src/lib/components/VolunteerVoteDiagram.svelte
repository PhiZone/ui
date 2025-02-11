<script lang="ts">
  import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
  } from 'chart.js';
  import { Line } from 'svelte-chartjs';

  import type { VolunteerVoteDto } from '$lib/api/vote.volunteer';

  import { t } from '$lib/translations/config';

  export let votes: VolunteerVoteDto[];
  export let ranked: boolean;

  const datasets = [
    {
      label: `${$t('studio.submission.vote_diagram.actual')}`,
      data: Array.from({ length: votes.length }, (_, index) => {
        return (
          votes
            .toReversed()
            .slice(0, index + 1)
            .map((vote) => vote.score)
            .reduce((a, b) => a + b, 0) /
          (index + 1)
        );
      }),
      backgroundColor: ['rgba(238, 129, 195, 0.25)'],
      borderColor: ['rgb(238, 129, 195)'],
      borderRadius: 4,
      borderWidth: 2,
    },
    {
      label: `${$t('studio.submission.vote_diagram.bound_approved')}`,
      data: [NaN, 1.5, 0.9, 0.45, 0.15, 0],
      backgroundColor: ['rgba(60, 149, 255, 0.25)'],
      borderColor: ['rgb(60, 149, 255)'],
      fill: ranked ? 3 : 'end',
      borderRadius: 4,
      borderWidth: 2,
    },
    {
      label: `${$t('studio.submission.vote_diagram.bound_rejected')}`,
      data: [NaN, -2.4, -1.2, -0.5, -0.2, 0],
      backgroundColor: ['rgba(255, 60, 60, 0.25)'],
      borderColor: ['rgb(255, 60, 60)'],
      fill: 'start',
      borderRadius: 4,
      borderWidth: 2,
    },
  ];

  if (ranked) {
    datasets.push({
      label: `${$t('studio.submission.vote_diagram.bound_ranked')}`,
      data: [NaN, 2.5, 2.1, 1.8, 1.6, 1.5],
      backgroundColor: ['rgba(132, 204, 83, 0.25)'],
      borderColor: ['rgb(132, 204, 83)'],
      fill: 'end',
      borderRadius: 4,
      borderWidth: 2,
    });
  }

  $: data = {
    labels: Array.from({ length: 6 }, (_, index) =>
      $t('studio.submission.vote_diagram.n_votes', {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        count: index + 1,
      }),
    ),
    datasets: datasets,
  };

  ChartJS.register(PointElement, LineElement, LinearScale, CategoryScale, Tooltip, Filler);
  ChartJS.defaults.font.family = "'Outfit', 'Noto Sans SC', sans-serif";
  ChartJS.defaults.font.size = 14;
  ChartJS.defaults.borderColor = 'rgba(150, 150, 150, 0.5)';
  ChartJS.defaults.color = 'rgb(150, 150, 150)';
</script>

<Line
  {data}
  options={{
    scales: {
      y: {
        suggestedMin: -3,
        suggestedMax: 3,
      },
    },
  }}
/>
