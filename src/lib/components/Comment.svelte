<script lang="ts">
  import { locale, t } from '$lib/translations/config';
  import type { CommentDto, UserDto } from '$lib/api';
  import { getUserPrivilege, parseDateTime } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import { page } from '$app/stores';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import type { ParsedQuery } from 'query-string';
  import Like from './Like.svelte';
  import Pagination from './Pagination.svelte';
  import Delete from './Delete.svelte';
  import User from './User.svelte';
  import ReplyComponent from './Reply.svelte';

  $: ({ user, api } = $page.data);

  export let type: string | undefined = undefined;
  export let comment: CommentDto;
  export let showUser = true;
  export let showSource = false;
  export let searchParams: ParsedQuery<string | number | boolean>;

  const queryClient = useQueryClient();

  $: disabled = !user;
  let replyText = '';
  const sendReply = async () => {
    if (replyText.length > 0) {
      disabled = true;
      await api.reply.create({ commentId: comment.id, content: replyText, language: $locale });
      disabled = false;
      replyText = '';
      await queryClient.invalidateQueries([
        'reply.list',
        { commentId: comment.id, page: replyPage },
      ]);
    }
  };

  $: replyPage = typeof searchParams.reply_page === 'number' ? searchParams.reply_page : 1;
  $: query = createQuery(api.reply.list({ commentId: comment.id, page: replyPage }));

  const replyTo = async (user: UserDto) => {
    replyText = `${$t('common.reply_to')}@${user.userName}${$t('common.colon')}`;
    // replyText = `${$t('common.reply_to')}[PZUserMention:${user.id}:${user.userName}:PZRT]${$t(
    //   'common.colon',
    // )}`;
  };

  $: source = `${type}/${comment.resourceId}`;
  $: content = richtext(comment.content);
</script>

<input type="checkbox" id="comment-{comment.id}-replies" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-100 max-h-[90vh] min-w-[70vw] w-[75vw] max-w-[1800px]">
    <label
      for="comment-{comment.id}-replies"
      class="btn border-2 normal-border btn-outline btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <h2 class="font-bold text-xl mb-4">{$t('common.replies')}</h2>
    <div class="flex items-center mx-5 mb-3">
      <textarea
        class="mr-3 textarea transition border-2 normal-border hover:textarea-secondary w-11/12"
        placeholder={$t('common.write_reply')}
        {disabled}
        bind:value={replyText}
      />
      <button
        class="ml-3 btn border-2 btn-outline btn-primary w-1/12 min-w-fit"
        disabled={disabled || replyText.length === 0}
        on:click={sendReply}
      >
        {$t('common.send')}
      </button>
    </div>
    <ul class="menu bg-base-100 w-full">
      {#if $query.isLoading}
        <div />
      {:else if $query.isSuccess}
        {@const { total, perPage, data } = $query.data}
        {#if total && perPage && data && data.length > 0}
          {#each data as reply}
            <ReplyComponent {reply} {replyTo} />
          {/each}
          <Pagination {total} {perPage} page={replyPage} pageName="reply_page" {searchParams} />
        {:else}
          <p class="py-3 text-center">{$t('common.empty')}</p>
        {/if}
      {/if}
    </ul>
  </div>
</div>

<div class="card card-side w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
  {#if showUser}
    <figure class="w-1/3 xs:w-1/6">
      <div
        class="relative inline-flex flex-col items-center justify-center border-r normal-border px-3 py-3 mx-auto my-auto w-full"
      >
        <User id={comment.ownerId} kind="embedded" />
      </div>
    </figure>
  {/if}
  <div class="card-body w-2/3 md:w-5/6 pt-6 pl-6 pb-4 pr-4">
    <p class="w-full content text-lg">
      {@html $content}
    </p>
    <div class="card-actions mt-4 flex flex-col sm:flex-row justify-between items-center">
      <p class="text-xs lg:text-sm opacity-70">
        {parseDateTime(comment.dateCreated, true, user?.language)}
      </p>
      {#if user && (getUserPrivilege(user.role) >= 5 || user.id === comment.ownerId)}
        <Delete id={comment.id} path="comments" name="common.comments" class="btn-sm btn-square" />
      {/if}
      <div class="items-center join join-vertical sm:join-horizontal">
        <Like
          id={comment.id}
          likes={comment.likeCount}
          type="comments"
          liked={comment.dateLiked != null}
          class="btn-sm w-full sm:w-fit join-item"
        />
        <label
          for="comment-{comment.id}-replies"
          class="btn btn-sm btn-ghost border-2 hover:btn-outline gap-2 w-full sm:w-fit join-item"
          class:animate-pulse={!$query.isSuccess}
        >
          <i class="fa-regular fa-comment-dots fa-lg"></i>
          {#if $query.isSuccess}
            {$query.data.total}
          {/if}
        </label>
        {#if showSource && type && source}
          <a class="btn btn-sm btn-ghost border-2 hover:btn-outline join-item" href={source}>
            <i class="fa-solid fa-link"></i>
            {$t('common.source')}
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
