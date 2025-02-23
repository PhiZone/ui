<script lang="ts">
  import { t } from '$lib/translations/config';

  interface Props {
    open: boolean;
    illustrator: string;
    illustration: string;
  }
  let { open = $bindable(), illustrator, illustration }: Props = $props();

  let modal: HTMLDialogElement;

  $effect(() => {
    if (open) {
      modal.showModal();
    } else {
      modal.close();
    }
  });
</script>

<!-- TODO: better way to close  -->
<dialog bind:this={modal} class="modal" onclose={() => (open = false)}>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
  <div class="modal-box bg-base-100 p-0 max-w-fit aspect-video">
    <form method="dialog">
      <button
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2 text-white mix-blend-difference hover:text-inherit hover:mix-blend-normal"
      >
        ✕
      </button>
    </form>
    <div class="absolute left-2 bottom-2">
      <div class="join join-horizontal">
        <div class="btn btn-secondary btn-xs join-item text-base no-animation">
          {$t('common.illustrator')}
        </div>
        <div class="btn btn-xs join-item text-base no-animation">
          {illustrator}
        </div>
      </div>
    </div>
    <img src={illustration} alt={$t('common.illustration')} class="object-cover" />
  </div>
</dialog>
