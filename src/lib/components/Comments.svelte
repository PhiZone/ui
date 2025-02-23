<script lang="ts">
  import type { ParsedQuery } from 'query-string';

  import { createQuery, useQueryClient } from '@tanstack/svelte-query';

  import { page } from '$app/state';
  import { locale, t } from '$lib/translations/config';

  import CommentComponent from './Comment.svelte';
  import Paginator from './Paginatior.svelte';

  let { user, api } = $derived(page.data);

  interface Props {
    type:
      | 'chapters'
      | 'songs'
      | 'charts'
      | 'records'
      | 'applications'
      | 'collections'
      | 'events'
      | 'events/divisions';
    id: string;
    showUser?: boolean;
    showSource?: boolean;
    searchParams: ParsedQuery<string | number | boolean>;
  }
  let { type, id, showUser = true, showSource = false, searchParams }: Props = $props();

  const queryClient = useQueryClient();

  let commentPage = $derived(
    typeof searchParams.comment_page === 'number' ? searchParams.comment_page : 1,
  );
  let options = $derived(
    api.comment.list({
      type,
      id,
      page: commentPage,
      order: ['likeCount', 'dateCreated'],
      desc: [true, true],
    }),
  );
  let query = $derived(createQuery({ ...options }));

  let disabled = $state(false);
  $effect(() => {
    disabled = !user;
  });
  let commentText = $state('');
  const sendComment = async () => {
    if (commentText.length > 0) {
      disabled = true;
      await api.comment.create({ type, id, content: commentText, language: $locale });
      disabled = false;
      commentText = '';
      await queryClient.invalidateQueries({ queryKey: options.queryKey });
    }
  };
</script>

<div class="indicator w-full my-4">
  <span
    class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
    style:--tw-translate-x="0"
  >
    {$t('common.comments')}
  </span>
  <div
    class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
  >
    <div class="card-body py-10">
      <div class="flex items-center">
        <textarea
          class="mr-3 textarea transition border-2 normal-border hover:textarea-secondary w-11/12"
          placeholder={$t('common.write_comment')}
          bind:value={commentText}
          {disabled}
        ></textarea>
        <button
          class="ml-3 btn {disabled || commentText.length === 0
            ? 'btn-disabled'
            : 'border-2 btn-outline'} btn-primary w-1/12 min-w-fit"
          onclick={sendComment}
          disabled={disabled || commentText.length === 0}
        >
          {$t('common.send')}
        </button>
      </div>
      {#if $query.isLoading}
        <div></div>
      {:else if $query.isSuccess}
        {@const { total, perPage, data } = $query.data}
        {#if total && perPage && data && data.length > 0}
          {#each data as comment}
            <CommentComponent {type} {comment} {showUser} {showSource} {searchParams} />
          {/each}
          <Paginator {total} {perPage} page={commentPage} pageName="comment_page" {searchParams} />
        {:else}
          <p class="py-3 text-center">{$t('common.empty')}</p>
        {/if}
      {/if}
    </div>
  </div>
</div>
