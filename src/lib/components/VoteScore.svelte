<script lang="ts">
  interface Props {
    score: number;
    size?: number;
    centered?: boolean;
    obsolete?: boolean;
  }
  let { score, size = 20, centered = true, obsolete = false }: Props = $props();
</script>

<div
  class="flex{centered ? ' justify-center' : ''}"
  style:min-width="{size * 3.6}px"
  class:opacity-40={obsolete}
>
  <span class="font-extrabold" style:font-size="{size * 1.8}px" style:line-height="{size * 2}px">
    {score < 0 ? '-' : ''}{Math.floor(Math.abs(score))}
  </span>
  <span class="font-bold" style:font-size="{size}px" style:line-height="{size * 1.6}px">.</span>
  <span class="font-bold" style:font-size="{size}px" style:line-height="{size * 1.6}px">
    {(score % 1).toFixed(2).split('.')[1]}
  </span>
</div>
