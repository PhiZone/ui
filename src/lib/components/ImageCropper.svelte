<script lang="ts">
  import Cropper from 'cropperjs';
  import 'cropperjs/dist/cropper.min.css';
  import { onMount } from 'svelte';

  import { t } from '$lib/translations/config';

  interface Props {
    open?: boolean;
    title: string;
    src: string;
    aspectRatio?: number | undefined;
    rounded?: boolean;
    submit?: (blob: Blob) => void;
  }
  let {
    open = $bindable(false),
    title,
    src,
    aspectRatio = undefined,
    rounded = false,
    submit,
  }: Props = $props();

  let el: HTMLImageElement;
  let cropper: Cropper;
  let croppable = $state(false);
  let submitting = $state(false);

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
      onclick={() => {
        submitting = true;
        cropper.getCroppedCanvas().toBlob((blob) => submit?.(blob!));
      }}
    >
      {$t(!submitting ? 'common.submit' : 'common.waiting')}
    </button>
  </div>
</div>
