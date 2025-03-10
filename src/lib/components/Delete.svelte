<script lang="ts">
  import { page } from '$app/state';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  const { api } = page.data;

  interface Props {
    id: string;
    path: string;
    name?: string;
    class: string;
    hasText?: boolean;
    onDelete?: () => void;
  }
  let { id, path, name, hasText = false, onDelete, ...rest }: Props = $props();

  let status = $state(Status.WAITING);
  let confirm = $state(0);

  const doDelete = async () => {
    status = Status.SENDING;
    const resp = await api.DELETE(`/${path}/${id}`);
    if (resp.ok || resp.status === 404) {
      status = Status.OK;
      onDelete?.();
    } else {
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
  };
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
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <label for="delete-{id}" class="btn border-2 normal-border btn-outline" onclick={doDelete}>
        {$t('common.confirm')}
      </label>
    </div>
  </div>
</div>

{#if name}
  <label
    for="delete-{id}"
    class="btn btn-ghost {status != Status.WAITING ? 'btn-disabled' : 'border-2'} {rest.class}"
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
{:else}
  <button
    class="btn btn-ghost {status != Status.WAITING ? 'btn-disabled' : 'border-2'} {rest.class}"
    onclick={async () => {
      confirm += 1;
      setTimeout(() => {
        if (confirm === 1) confirm = 0;
      }, 3000);
      if (confirm === 2) {
        await doDelete();
      }
    }}
  >
    {#if confirm === 1}
      <span><i class="fa-solid fa-check fa-lg"></i></span>
    {:else if status != Status.SENDING}
      <span><i class="fa-regular fa-trash-can fa-lg"></i></span>
    {:else}
      <span class="loading loading-dots loading-xs"></span>
    {/if}
    {#if hasText}
      <span>
        {$t(
          status == Status.OK
            ? 'common.deleted'
            : confirm === 1
              ? 'common.confirm'
              : 'common.delete',
        )}
      </span>
    {/if}
  </button>
{/if}
