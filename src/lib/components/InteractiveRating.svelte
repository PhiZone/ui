<script lang="ts">
  export let rating = 0;
  export let aspect: string;
  export let size = 'lg';
</script>

<input type="hidden" id={aspect} name={aspect} value={rating} />
<div class="rating rating-{size}">
  {#each [...Array(6).keys()] as i}
    <input
      type="radio"
      class={i > 0 ? 'mask mask-star-2' : 'rating-hidden'}
      checked={rating > i - 1 && rating <= i}
      on:click={() => {
        rating = i;
      }}
    />
  {/each}
</div>
