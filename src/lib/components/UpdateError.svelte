<script lang="ts">
  import type { ResponseDtoError } from '$lib/api/types';

  import { t } from '$lib/translations/config';

  interface Props {
    id?: string;
    checked: boolean;
    onClick: () => void;
    error?: ResponseDtoError;
    buttonText?: string;
  }
  let { id = 'update-error', checked, onClick, error, buttonText }: Props = $props();
</script>

<input type="checkbox" {id} class="modal-toggle" {checked} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{$t(error?.code ? `error.${error.code}` : 'common.error')}</h3>
    {#if error?.message}
      <p class="py-4">{error.message}</p>
    {/if}
    <div class="modal-action">
      <button class="btn border-2 btn-outline" onclick={onClick}>
        {buttonText ?? $t('common.confirm')}
      </button>
    </div>
  </div>
</div>
