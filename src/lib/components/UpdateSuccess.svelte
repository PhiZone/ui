<script lang="ts">
  import { t } from '$lib/translations/config';

  export let id = 'update-success';
  export let checked: boolean;
  export let onClick: () => void;
  export let title = $t('common.success');
  export let content = $t('common.update_success');
  export let buttonText = $t('common.confirm');
</script>

<input type="checkbox" {id} class="modal-toggle" {checked} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{title}</h3>
    <p class="py-4">{content}</p>
    <div class="modal-action">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <btn class="btn btn-success border-2 btn-outline" on:click={onClick} on:keyup>
        {buttonText}
      </btn>
    </div>
  </div>
</div>
