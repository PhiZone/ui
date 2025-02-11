<script lang="ts">
  import type { ResponseDtoError } from '$lib/api/types';

  import { t } from '$lib/translations/config';

  export let id = 'update-error';
  export let checked: boolean;
  export let onClick: () => void;
  export let error: ResponseDtoError | undefined = undefined;
  export let buttonText: string | undefined = undefined;
</script>

<input type="checkbox" {id} class="modal-toggle" {checked} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{$t(error?.code ? `error.${error.code}` : 'common.error')}</h3>
    {#if error?.message}
      <p class="py-4">{error.message}</p>
    {/if}
    <div class="modal-action">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <btn class="btn border-2 btn-outline" on:click={onClick} on:keyup>
        {buttonText ?? $t('common.confirm')}
      </btn>
    </div>
  </div>
</div>
