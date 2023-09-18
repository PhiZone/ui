<script>
  export let rating = 0;
  export let size = 'sm';
  export let direction = 'right';
</script>

<div class="tooltip tooltip-{direction}" data-tip={rating.toFixed(2)}>
  <div class="rating rating-{size} rating-half">
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-1"
      checked={rating > 0.25 && rating <= 0.75}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-2"
      checked={rating > 0.75 && rating <= 1.25}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-1"
      checked={rating > 1.25 && rating <= 1.75}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-2"
      checked={rating > 1.75 && rating <= 2.25}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-1"
      checked={rating > 2.25 && rating <= 2.75}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-2"
      checked={rating > 2.75 && rating <= 3.25}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-1"
      checked={rating > 3.25 && rating <= 3.75}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-2"
      checked={rating > 3.75 && rating <= 4.25}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-1"
      checked={rating > 4.25 && rating <= 4.75}
      disabled
    />
    <input
      type="radio"
      class="bg-primary mask mask-star-2 mask-half-2"
      checked={rating > 4.75}
      disabled
    />
  </div>
</div>
