<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Cropper from 'cropperjs';
  import { t } from '$lib/translations/config';

  export let open = false;
  export let title: string;
  export let src: string;
  export let aspectRatio: number | undefined = undefined;

  const dispatch = createEventDispatcher<{
    submit: Blob;
  }>();

  let el: HTMLImageElement;
  let cropper: Cropper;
  let croppable = false;

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
    cropper.getCroppedCanvas().toBlob((blob) => dispatch('submit', blob!));
  };
</script>

<input type="checkbox" id="imagecropper" class="modal-toggle" bind:checked={open} />
<label for="imagecropper" class="modal cursor-pointer">
  <label class="modal-box flex flex-col gap-2 relative" for="">
    <h3 class="text-lg font-bold">{title}</h3>
    <div class="w-full">
      <img bind:this={el} {src} alt="" class="w-full" />
    </div>
    <button class="btn btn-primary" disabled={!croppable} on:click={submit}>
      {$t('common.submit')}
    </button>
  </label>
</label>
