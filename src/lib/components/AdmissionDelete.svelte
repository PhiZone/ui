<script lang="ts">
  import type { ChapterAdmissionDto, CollectionAdmissionDto } from '$lib/api/admission';

  import { page } from '$app/state';
  import { t } from '$lib/translations/config';

  let { api } = $derived(page.data);

  interface Props {
    target: ChapterAdmissionDto | CollectionAdmissionDto;
    type: 'chapter' | 'collection';
    class: string;
  }
  let { target, type, ...rest }: Props = $props();
  let deleted = $state(false);
</script>

<input type="checkbox" id="delete-{target.admitter.id}-{target.admittee.id}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box text-left">
    <label
      for="delete-{target.admitter.id}-{target.admittee.id}"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg">{$t('common.delete')}</h3>
    <p class="py-4">
      {$t('common.delete_confirmation', {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resource: $t(`studio.${type}_admission`),
      })}
    </p>
    <div class="modal-action">
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <label
        for="delete-{target.admitter.id}-{target.admittee.id}"
        class="btn border-2 normal-border btn-outline"
        onclick={async () => {
          const resp = await api.DELETE(
            `/admissions/${type}s/${target.admitter.id}/${target.admittee.id}`,
          );
          if (resp.ok || resp.status === 404) {
            deleted = true;
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
  for="delete-{target.admitter.id}-{target.admittee.id}"
  class="btn {deleted ? 'btn-ghost btn-disabled' : 'border-2 btn-ghost'} {rest.class}"
>
  <i class="fa-regular fa-trash-can fa-lg"></i>
  {$t('common.delete')}
</label>
