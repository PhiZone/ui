<script lang="ts">
  export let suggested: number;
  export let actual: number;
  export let size = 20;
  export let centered = true;
  export let compact = false;
  export let obsolete = false;

  $: difference = suggested - actual;
  $: displayedDifference = Math.round((suggested - actual) * 10) / 10;
</script>

<div class="flex flex-col">
  <div
    class="flex{centered ? ' justify-center' : ''}"
    style:min-width="{size * 3.6}px"
    class:opacity-40={obsolete}
  >
    <span class="font-extrabold" style:font-size="{size * 1.8}px" style:line-height="{size * 2}px">
      {suggested < 0 ? '-' : ''}{Math.floor(Math.abs(suggested))}
    </span>
    <span class="font-bold" style:font-size="{size * 1.3}px" style:line-height="{size * 1.8}px">
      .
    </span>
    <span class="font-bold" style:font-size="{size * 1.3}px" style:line-height="{size * 1.8}px">
      {(suggested % 1).toFixed(1).split('.')[1]}
    </span>
    {#if !compact}
      <span
        class="opacity-80 self-center ml-2 {Math.abs(difference) < 0.4
          ? 'text-success'
          : 'text-error'}"
      >
        ({displayedDifference >= 0
          ? `+${displayedDifference.toFixed(1)}`
          : displayedDifference.toFixed(1)})
      </span>
    {/if}
  </div>
  {#if compact}
    <span
      class="opacity-80 {centered ? ' self-center' : ''} {Math.abs(difference) < 0.4
        ? 'text-success'
        : 'text-error'}"
    >
      ({displayedDifference >= 0
        ? `+${displayedDifference.toFixed(1)}`
        : displayedDifference.toFixed(1)})
    </span>
  {/if}
</div>
