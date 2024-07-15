<script lang="ts">
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import type { ReservedFieldDto } from '$lib/api/event';
  import { Status } from '$lib/constants';
  import { invalidateAll } from '$app/navigation';

  $: ({ api } = $page.data);

  export let type: 'teams' | 'resources';
  export let id: string;
  export let field: ReservedFieldDto | null;
  export let headerIndex: number | undefined;
  export let editable: boolean;

  let status = Status.WAITING;
  let content = field?.content ?? null;
  let different = false;
  let errorCode = '';

  const update = async () => {
    const index = field?.index ?? headerIndex;
    if (!index) return;
    status = Status.SENDING;
    const resp = await api.event.division.updateReservedField({
      type,
      id,
      index,
      content,
    });
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
      different = false;
    } else {
      status = Status.ERROR;
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
  };
</script>

<div class="relative min-w-[80px]">
  <textarea
    class="w-full h-full textarea textarea-sm leading-5 textarea-ghost border-2 transition hover:border-secondary"
    class:textarea-disabled={!editable}
    disabled={!editable}
    value={content ?? ''}
    on:input={(e) => {
      content = e.currentTarget.value ?? null;
      different = !((!content && !field?.content) || content == field?.content);
    }}
  />
  {#if editable}
    <div
      class="absolute right-3 bottom-3 tooltip tooltip-top tooltip-error"
      class:tooltip-open={status === Status.ERROR}
      data-tip={status === Status.ERROR
        ? errorCode
          ? $t(`error.${errorCode}`)
          : $t('common.unknown_error')
        : null}
    >
      <button
        class="btn btn-xs border-2 {status === Status.ERROR
          ? 'btn-error'
          : status === Status.SENDING || !different
            ? 'btn-ghost'
            : 'btn-outline normal-border'} w-full backdrop-blur"
        disabled={status == Status.SENDING || !different}
        on:click={update}
      >
        {status === Status.ERROR
          ? $t('common.error')
          : status === Status.SENDING
            ? $t('common.waiting')
            : $t('common.submit')}
      </button>
    </div>
  {/if}
</div>
