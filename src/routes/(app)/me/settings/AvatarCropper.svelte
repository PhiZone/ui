<script lang="ts">
  import { onMount } from 'svelte';
  import Cropper from 'cropperjs';
  import { useQueryClient } from '@tanstack/svelte-query';
  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';

  $: ({ api } = $page.data);
  const queryClient = useQueryClient();

  export let id: number;
  export let open = false;
  export let src: string;

  let el: HTMLImageElement;
  let cropper: Cropper;
  let croppable = false;

  onMount(() => {
    croppable = false;
    cropper = new Cropper(el, {
      aspectRatio: 1,
      viewMode: 1,
      zoomable: false,
      ready() {
        croppable = true;
      },
    });
  });

  const submit = () => {
    if (!croppable) return;
    cropper.getCroppedCanvas().toBlob(async (blob) => {
      const resp = await api.user.update({ id, avatar: blob ?? undefined });
      if (resp.ok) {
        await invalidateAll();
        await queryClient.invalidateQueries(['user.info', { id }]);
        open = false;
      } else {
        const { detail } = await resp.json();
        // TODO: toast
        console.error(detail);
      }
    });
  };
</script>

<input type="checkbox" id="imagecropper" class="modal-toggle" bind:checked={open} />
<label for="imagecropper" class="modal cursor-pointer">
  <label class="modal-box flex flex-col gap-2 relative" for="">
    <h3 class="text-lg font-bold">{$t('user.crop_avatar')}</h3>
    <div class="w-full">
      <img bind:this={el} {src} alt="avatar" class="w-full" />
    </div>
    <button class="btn btn-primary" disabled={!croppable} on:click={submit}>
      {$t('common.submit')}
    </button>
  </label>
</label>
