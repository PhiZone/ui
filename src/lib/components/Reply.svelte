<script lang="ts">
  import { page } from '$app/stores';
  import type { ReplyDto, UserDto } from '$lib/api';
  import { getUserPrivilege, parseDateTime } from '$lib/utils';
  import { t } from '$lib/translations/config';
  import { richtext } from '$lib/richtext';
  import Like from './Like.svelte';
  import Delete from './Delete.svelte';
  import User from './User.svelte';
  import { createQuery } from '@tanstack/svelte-query';

  $: ({ api, user } = $page.data);

  export let kind: 'mini' | 'full' = 'mini';
  export let reply: ReplyDto;
  export let replyTo: (reply: UserDto) => void = (_) => {};

  $: content = richtext(reply.content);
  $: owner = createQuery(api.user.info({ id: reply.ownerId }));
</script>

{#if kind === 'mini'}
  <li class="max-w-full">
    <div class="flex w-full">
      <User id={reply.ownerId} initUser={$owner.data?.data} kind="embedded-mini" />
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="ml-2 w-3/4 min-w-fit content"
        on:click={() => {
          if ($owner.isSuccess && $owner.data) replyTo($owner.data.data);
        }}
        on:keyup
      >
        {@html $content}
      </div>
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <p
        class="w-1/6 min-w-fit text-sm opacity-70 overflow-hidden"
        on:click={() => {
          if ($owner.isSuccess && $owner.data) replyTo($owner.data.data);
        }}
        on:keyup
      >
        {parseDateTime(reply.dateCreated)}
      </p>
      <div class="min-w-fit text-right flex items-center gap-1">
        {#if user && (getUserPrivilege(user.role) >= 4 || user.id === reply.ownerId)}
          <Delete target={reply} class="btn-sm" />
        {/if}
        <Like
          id={reply.id}
          likes={reply.likeCount}
          type="replies"
          liked={reply.dateLiked != null}
          class="btn-sm"
        />
      </div>
    </div>
  </li>
{:else}
  <div class="card card-side w-full bg-base-100 border border-base-300 shadow-lg">
    <figure class="w-1/3 min-w-fit">
      <div
        class="relative inline-flex flex-col items-center border-r border-base-300 px-3 py-3 mx-auto my-auto"
      >
        <User id={reply.ownerId} kind="embedded" />
      </div>
    </figure>
    <div class="card-body w-2/3 pt-6 pl-6 pb-4 pr-4">
      <p class="w-full content text-lg">
        {@html $content}
      </p>
      <div class="card-actions mt-4 flex justify-between items-center">
        <p class="text-sm opacity-70">
          {parseDateTime(reply.dateCreated)}
        </p>
        <div class="flex items-center gap-1">
          {#if user && (getUserPrivilege(user.role) >= 4 || user.id === reply.ownerId)}
            <Delete target={reply} class="btn-sm" />
          {/if}
          <Like
            id={reply.id}
            likes={reply.likeCount}
            type="replies"
            liked={reply.dateLiked != null}
            class="btn-sm"
          />
          {#if reply.commentId}
            <a class="btn btn-sm btn-primary btn-outline" href="/comments/{reply.commentId}">
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
{/if}
