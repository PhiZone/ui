<script lang="ts">
  import type { HTMLCanvasAttributes } from 'svelte/elements';

  import { Chart, type ChartData, type ChartOptions, RadarController } from 'chart.js';
  import { onMount } from 'svelte';

  Chart.register(RadarController);

  interface Props extends HTMLCanvasAttributes {
    data: ChartData<'radar', number[], string>;
    options: ChartOptions<'radar'>;
  }

  const { data, options, ...rest }: Props = $props();

  let canvasElem: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    chart = new Chart(canvasElem, {
      type: 'radar',
      data,
      options,
    });

    return () => {
      chart.destroy();
    };
  });

  $effect(() => {
    if (chart) {
      chart.data = data;
      chart.update();
    }
  });
</script>

<canvas bind:this={canvasElem} {...rest}></canvas>
