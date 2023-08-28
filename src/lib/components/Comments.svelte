<script lang="ts">
  import { page } from '$app/stores';
  import { locale, t } from '$lib/translations/config';
  import type { ParsedQuery } from 'query-string';
  import CommentComponent from './Comment.svelte';
  import Pagination from './Pagination.svelte';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';

  $: ({ user, api } = $page.data);

  export let type: 'chapters' | 'songs' | 'charts' | 'records';
  export let id: string;
  export let showUser = true;
  export let showSource = false;
  export let searchParams: ParsedQuery<string | number | boolean>;

  const queryClient = useQueryClient();

  $: disabled = !user;
  let commentText = '';
  const sendComment = async () => {
    if (commentText.length > 0) {
      disabled = true;
      await api.comment.create({ type, id, content: commentText, language: locale.get() });
      disabled = false;
      commentText = '';
      await queryClient.invalidateQueries([
        'comment.list',
        { type, id, page: commentPage, order: 'likeCount', desc: true },
      ]);
    }
  };

  $: commentPage = typeof searchParams.comment_page === 'number' ? searchParams.comment_page : 1;
  $: query = createQuery(
    api.comment.list({ type, id, page: commentPage, order: 'likeCount', desc: true }),
  );
</script>

<div class="indicator w-full my-4">
  <span class="indicator-item indicator-start badge badge-secondary badge-lg w-20 h-8 text-lg">
    {$t('common.comments')}
  </span>
  <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
    <div class="card-body py-10">
      <div class="flex items-center">
        <textarea
          class="mr-3 textarea textarea-secondary w-11/12"
          placeholder={$t('common.write_comment')}
          bind:value={commentText}
          {disabled}
        />
        <button
          class="ml-3 btn btn-outline btn-primary w-1/12 min-w-fit"
          on:click={sendComment}
          disabled={disabled || commentText.length === 0}
        >
          {$t('common.send')}
        </button>
      </div>
      {#if $query.isLoading}
        <div />
      {:else if $query.isSuccess}
        {@const { total, perPage, data } = $query.data}
        {#if total && perPage && data && data.length > 0}
          {#each data as comment}
            <CommentComponent {type} {comment} {showUser} {showSource} {searchParams} />
          {/each}
          <Pagination {total} {perPage} page={commentPage} pageName="comment_page" {searchParams} />
        {:else}
          <p class="py-3 text-center">{$t('common.empty')}</p>
        {/if}
      {/if}
    </div>
  </div>
</div>
