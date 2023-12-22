<script lang="ts">
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';

  const { api } = $page.data;

  interface $$Props {
    id: string;
    path: string;
    name: string;
    class: string;
    hasText?: boolean;
  }

  export let id: string;
  export let path: string;
  export let name: string;
  export let hasText = false;
  let deleted = false;
</script>

<input type="checkbox" id="delete-{id}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box text-left">
    <label
      for="delete-{id}"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg">{$t('common.delete')}</h3>
    <p class="py-4">
      {$t('common.delete_confirmation', {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resource: $t(name),
      })}
    </p>
    <div class="modal-action">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <label
        for="delete-{id}"
        class="btn border-2 normal-border btn-outline"
        on:click={async () => {
          const resp = await api.DELETE(`/${path}/${id}`);
          if (resp.ok || resp.status === 404) {
            deleted = true;
          } else {
            console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, await resp.json());
          }
        }}
      >
        {$t('common.confirm')}
      </label>
    </div>
  </div>
</div>

<label
  for="delete-{id}"
  class="btn {deleted ? 'btn-ghost btn-disabled' : 'border-2 btn-ghost'} {$$restProps.class}"
>
  <i class="fa-regular fa-trash-can fa-lg"></i>
  {#if hasText}
    {$t('common.delete')}
  {/if}
</label>
