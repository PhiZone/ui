<script lang="ts">
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import { Status } from '$lib/constants';

  const { api } = $page.data;

  interface $$Props {
    id: string;
    path: string;
    name: string;
    class: string;
    hasText?: boolean;
    onDelete?: () => void;
  }

  export let id: string;
  export let path: string;
  export let name: string;
  export let hasText = false;
  export let onDelete: () => void = () => {};
  let status = Status.WAITING;
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
          status = Status.SENDING;
          const resp = await api.DELETE(`/${path}/${id}`);
          if (resp.ok || resp.status === 404) {
            status = Status.OK;
            onDelete();
          } else {
            console.error(
              `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
              await resp.json(),
            );
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
  class="btn {status != Status.WAITING
    ? 'btn-ghost btn-disabled'
    : 'border-2 btn-ghost'} {$$restProps.class}"
>
  {#if status != Status.SENDING}
    <span><i class="fa-regular fa-trash-can fa-lg"></i></span>
  {:else}
    <span class="loading loading-dots loading-xs"></span>
  {/if}
  {#if hasText}
    <span>{$t(status == Status.OK ? 'common.deleted' : 'common.delete')}</span>
  {/if}
</label>
