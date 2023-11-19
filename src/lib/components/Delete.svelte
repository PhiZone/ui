<script lang="ts">
  import type { CommentDto, ReplyDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';

  const { api } = $page.data;

  interface $$Props {
    target: CommentDto | ReplyDto;
    class: string;
  }

  export let target: CommentDto | ReplyDto;
  let typePlural: 'comments' | 'replies' =
    (target as CommentDto).replyCount >= 0 ? 'comments' : 'replies';
  let type: 'comment' | 'reply' = 'replyCount' in target ? 'comment' : 'reply';
  let deleted = false;
</script>

<input type="checkbox" id="delete-{target.id}" class="modal-toggle" />
<div class="modal">
  <div class="modal-box text-left">
    <label for="delete-{target.id}" class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
      ✕
    </label>
    <h3 class="font-bold text-lg">{$t('common.delete')}</h3>
    <p class="py-4">
      {$t('common.delete_confirmation').replace('{resource}', $t(`common.${type}`))}
    </p>
    <div class="modal-action">
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <label
        for="delete-{target.id}"
        class="btn"
        on:click={async () => {
          const resp = await api.DELETE(`/${typePlural}/${target.id}`);
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
  for="delete-{target.id}"
  class="btn {deleted
    ? 'btn-ghost btn-disabled'
    : 'btn-ghost'} btn-sm flex gap-1 items-center {$$restProps.class}"
>
  <i class="fa-regular fa-trash-can fa-lg"></i>
</label>
