<script lang="ts">
  import { t } from '$lib/translations/config';

  interface Props {
    id?: string;
    checked: boolean;
    onClick: () => void;
    title?: string;
    content?: string;
    buttonText?: string;
  }

  let { id = 'update-success', checked, onClick, title, content, buttonText }: Props = $props();
</script>

<input type="checkbox" {id} class="modal-toggle" {checked} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{title ?? $t('common.success')}</h3>
    <p class="py-4">{content ?? $t('common.update_success')}</p>
    <div class="modal-action">
      <button class="btn btn-success border-2 btn-outline" onclick={onClick}>
        {buttonText ?? $t('common.confirm')}
      </button>
    </div>
  </div>
</div>
