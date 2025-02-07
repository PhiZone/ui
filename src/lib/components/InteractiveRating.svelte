<script lang="ts">
  interface Props {
    rating?: number;
    aspect: string;
    size?: string;
  }
  let { rating = $bindable(0), aspect, size = 'lg' }: Props = $props();
</script>

<input type="hidden" id={aspect} name={aspect} value={rating} />
<div class="rating rating-{size}">
  {#each [...Array(6).keys()] as i}
    <input
      type="radio"
      class={i > 0 ? 'mask mask-star-2' : 'rating-hidden'}
      checked={rating > i - 1 && rating <= i}
      onclick={() => {
        rating = i;
      }}
    />
  {/each}
</div>
