<script lang="ts">
  import type { HTMLCanvasAttributes } from 'svelte/elements';

  import { Chart, type ChartData, type ChartOptions, LineController } from 'chart.js';
  import { onMount } from 'svelte';

  Chart.register(LineController);

  interface Props extends HTMLCanvasAttributes {
    data: ChartData<'line', number[], string>;
    options: ChartOptions<'line'>;
  }

  const { data, options, ...rest }: Props = $props();

  let canvasElem: HTMLCanvasElement;
  let chart: Chart;

  onMount(() => {
    chart = new Chart(canvasElem, {
      type: 'line',
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
