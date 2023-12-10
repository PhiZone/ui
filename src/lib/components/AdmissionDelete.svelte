<script lang="ts">
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import type { ChapterAdmissionDto, CollectionAdmissionDto } from '$lib/api/admission';

  const { api } = $page.data;

  interface $$Props {
    target: ChapterAdmissionDto | CollectionAdmissionDto;
    type: 'chapter' | 'collection';
    class: string;
  }

  export let target: ChapterAdmissionDto | CollectionAdmissionDto;
  export let type: 'chapter' | 'collection';
  let deleted = false;
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
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <label
        for="delete-{target.admitter.id}-{target.admittee.id}"
        class="btn btn-outline"
        on:click={async () => {
          const resp = await api.DELETE(
            `/admissions/${type}s/${target.admitter.id}/${target.admittee.id}`,
          );
          if (resp.ok || resp.status == 404) {
            deleted = true;
          } else {
            console.error(await resp.json());
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
  class="btn {deleted
    ? 'btn-ghost btn-disabled'
    : 'border-2 btn-ghost'} flex gap-1 items-center {$$restProps.class}"
>
  <i class="fa-regular fa-trash-can fa-lg"></i>
  {$t('common.delete')}
</label>
