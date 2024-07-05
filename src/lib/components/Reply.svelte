<script lang="ts">
  import { page } from '$app/stores';
  import type { ReplyDto, UserDto } from '$lib/api';
  import { getUserPrivilege, parseDateTime } from '$lib/utils';
  import { t } from '$lib/translations/config';
  import { richtext } from '$lib/richtext';
  import Like from './Like.svelte';
  import Delete from './Delete.svelte';
  import User from './User.svelte';

  $: ({ user } = $page.data);

  export let kind: 'mini' | 'full' = 'mini';
  export let reply: ReplyDto;
  export let replyTo: (reply: UserDto) => void = (_) => {};

  $: content = richtext(reply.content);
</script>

{#if kind === 'mini'}
  <li class="max-w-full">
    <div class="flex flex-col sm:flex-row w-full">
      <User id={reply.ownerId} initUser={reply.owner} kind="embedded-mini" />
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="ml-2 sm:w-3/4 content"
        on:click={() => {
          replyTo(reply.owner);
        }}
        on:keyup
      >
        {@html $content}
      </div>
      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
      <p
        class="hidden md:inline sm:w-1/6 min-w-fit text-sm opacity-70 overflow-hidden"
        on:click={() => {
          replyTo(reply.owner);
        }}
        on:keyup
      >
        {parseDateTime(reply.dateCreated, true, user?.language)}
      </p>
      <div class="min-w-fit text-right flex items-center gap-1">
        {#if user && (getUserPrivilege(user.role) >= 5 || user.id === reply.ownerId)}
          <Delete id={reply.id} path="replies" name="common.reply" class="btn-sm btn-square" />
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
  <div class="card card-side w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
    <figure class="w-1/3 xs:w-1/6">
      <div
        class="relative inline-flex flex-col items-center border-r normal-border px-3 py-3 mx-auto my-auto w-full"
      >
        <User id={reply.ownerId} kind="embedded" />
      </div>
    </figure>
    <div class="card-body w-2/3 md:w-5/6 pt-6 pl-6 pb-4 pr-4">
      <p class="w-full content text-lg">
        {@html $content}
      </p>
      <div class="card-actions mt-4 flex justify-between items-center">
        <p class="text-sm opacity-70">
          {parseDateTime(reply.dateCreated, true, user?.language)}
        </p>
        {#if user && (getUserPrivilege(user.role) >= 5 || user.id === reply.ownerId)}
          <Delete id={reply.id} path="replies" name="common.reply" class="btn-sm btn-square" />
        {/if}
        <div class="items-center join join-vertical sm:join-horizontal">
          <Like
            id={reply.id}
            likes={reply.likeCount}
            type="replies"
            liked={reply.dateLiked != null}
            class="btn-sm w-full sm:w-fit join-item"
          />
          {#if reply.commentId}
            <a
              class="btn btn-sm btn-primary btn-outline join-item"
              href="/comments/{reply.commentId}"
            >
              <i class="fa-solid fa-link"></i>
              {$t('common.source')}
            </a>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
