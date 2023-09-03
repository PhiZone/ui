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
      class="btn btn-primary btn-outline btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <h2 class="font-bold text-xl mb-4">{$t('common.replies')}</h2>
    <div class="flex items-center mx-5 mb-3">
      <textarea
        class="mr-3 textarea textarea-secondary w-11/12"
        placeholder={$t('common.write_reply')}
        {disabled}
        bind:value={replyText}
      />
      <button
        class="ml-3 btn btn-outline btn-primary w-1/12 min-w-fit"
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

<div class="card card-side w-full bg-base-100 border border-base-200 shadow-lg">
  {#if showUser}
    <figure class="w-1/3 xs:w-1/6">
      <div
        class="relative inline-flex flex-col items-center justify-center border-r border-base-200 px-3 py-3 mx-auto my-auto w-full"
      >
        <User id={comment.ownerId} kind="embedded" />
      </div>
    </figure>
  {/if}
  <div class="card-body w-2/3 md:w-5/6 pt-6 pl-6 pb-4 pr-4">
    <p class="w-full content text-lg">
      {@html $content}
    </p>
    <div class="card-actions mt-4 flex justify-between items-center">
      <p class="text-sm opacity-70">
        {parseDateTime(comment.dateCreated)}
      </p>
      <div class="flex items-center gap-1">
        {#if user && (getUserPrivilege(user.role) >= 4 || user.id === comment.ownerId)}
          <Delete target={comment} class="btn-sm" />
        {/if}
        <Like
          id={comment.id}
          likes={comment.likeCount}
          type="comments"
          liked={comment.dateLiked != null}
          class="btn-sm"
        />
        <label
          for="comment-{comment.id}-replies"
          class="btn btn-sm btn-primary btn-outline gap-2"
          class:animate-pulse={!$query.isSuccess}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            class="h-5 w-5"
            fill="currentColor"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="10"
              d="M464 512a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm200 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm-400 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 0 0-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 0 0-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 0 0 112 714v152a46 46 0 0 0 46 46h152.1A449.4 449.4 0 0 0 510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 0 0 142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"
            />
          </svg>
          {#if $query.isSuccess}
            {$query.data.total}
          {/if}
        </label>
        {#if showSource && type && source}
          <a class="btn btn-sm btn-primary btn-outline" href={source}>
            <svg
              fill="currentColor"
              width="25px"
              height="25px"
              viewBox="-5.5 0 32 32"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.52 23.72v0c-1.2 0-2.36-0.48-3.2-1.32-0.84-0.88-1.32-2-1.32-3.2s0.48-2.36 1.32-3.2l4.24-4.24c0.8-0.8 1.88-1.28 3.040-1.32 0.48 0 0.84 0.36 0.88 0.8 0 0.48-0.36 0.84-0.8 0.88-0.72 0.040-1.4 0.32-1.92 0.84l-4.24 4.2c-0.52 0.52-0.84 1.24-0.84 2s0.28 1.48 0.84 2c0.52 0.52 1.24 0.84 2 0.84s1.48-0.28 2-0.84l4.24-4.24c0.52-0.52 0.84-1.24 0.84-2 0-0.48 0.36-0.84 0.84-0.84s0.84 0.36 0.84 0.84c0 1.2-0.48 2.36-1.32 3.2l-4.24 4.24c-0.88 0.88-2 1.36-3.2 1.36zM12 21.56c-0.44 0-0.8-0.36-0.84-0.8 0-0.48 0.32-0.84 0.8-0.88 0.72-0.040 1.4-0.32 1.88-0.84l4.28-4.24c1.12-1.12 1.12-2.92 0-4-1.12-1.12-2.92-1.12-4 0l-4.28 4.24c-0.52 0.52-0.8 1.2-0.84 1.92 0 0.48-0.4 0.8-0.88 0.8s-0.84-0.4-0.8-0.88c0.040-1.16 0.52-2.24 1.32-3.040l4.28-4.24c1.76-1.76 4.64-1.76 6.4 0s1.76 4.64 0 6.4l-4.28 4.24c-0.8 0.8-1.84 1.28-3.040 1.32 0.040 0 0 0 0 0z"
              />
            </svg>
            {$t('common.source')}
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
