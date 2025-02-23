<script lang="ts">
  import type { ReservedFieldDto } from '$lib/api/event';

  import { invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  let { api } = $derived(page.data);

  interface Props {
    type: 'teams' | 'resources';
    id: string;
    field: ReservedFieldDto | null;
    headerIndex?: number;
    editable: boolean;
  }
  let { type, id, field, headerIndex, editable }: Props = $props();

  let status = $state(Status.WAITING);
  let content = $state(field?.content ?? null);
  let different = $state(false);
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

<div class="relative min-w-[135px]">
  <textarea
    class="w-full h-full textarea textarea-sm leading-5 textarea-ghost border-2 transition hover:border-secondary"
    class:textarea-disabled={!editable}
    disabled={!editable}
    value={content ?? ''}
    oninput={(e) => {
      content = e.currentTarget.value ?? null;
      different = !((!content && !field?.content) || content == field?.content);
    }}
  ></textarea>
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
        onclick={update}
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
