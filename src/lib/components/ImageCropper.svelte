<script lang="ts">
  import Cropper from 'cropperjs';
  import 'cropperjs/dist/cropper.min.css';
  import { createEventDispatcher, onMount } from 'svelte';

  import { t } from '$lib/translations/config';

  export let open = false;
  export let title: string;
  export let src: string;
  export let aspectRatio: number | undefined = undefined;
  export let rounded = false;

  const dispatch = createEventDispatcher<{
    submit: Blob;
  }>();

  let el: HTMLImageElement;
  let cropper: Cropper;
  let croppable = false;
  let submitting = false;

  onMount(() => {
    croppable = false;
    cropper = new Cropper(el, {
      aspectRatio,
      viewMode: 1,
      zoomable: false,
      ready() {
        croppable = true;
      },
    });
  });

  const submit = () => {
    submitting = true;
    cropper.getCroppedCanvas().toBlob((blob) => dispatch('submit', blob!));
  };
</script>

<input type="checkbox" id="imagecropper" class="modal-toggle" bind:checked={open} />
<div class="modal">
  <div class="modal-box flex flex-col gap-2 relative max-w-[50vw] w-fit">
    <label
      for="imagecropper"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="text-lg font-bold">{title}</h3>
    <div class="max-w-fit {rounded ? 'rounded-cropper' : ''}">
      <img bind:this={el} {src} alt="" class="w-full" />
    </div>
    <button
      class="btn border-2 normal-border {!submitting ? 'btn-outline' : 'btn-ghost'}"
      disabled={!croppable || submitting}
      on:click={submit}
    >
      {$t(!submitting ? 'common.submit' : 'common.waiting')}
    </button>
  </div>
</div>
