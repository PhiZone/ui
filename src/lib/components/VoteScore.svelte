<script lang="ts">
  export let score: number;
  export let size = 20;
  export let centered = true;
</script>

<div class="flex{centered ? ' justify-center' : ''}" style:min-width="{size * 3.6}px">
  <span class="font-extrabold" style:font-size="{size * 1.8}px" style:line-height="{size * 2}px">
    {score < 0 ? '-' : ''}{Math.floor(Math.abs(score))}
  </span>
  <span class="font-bold" style:font-size="{size}px" style:line-height="{size * 1.6}px">.</span>
  <span class="font-bold" style:font-size="{size}px" style:line-height="{size * 1.6}px">
    {(score % 1).toFixed(2).split('.')[1]}
  </span>
</div>
