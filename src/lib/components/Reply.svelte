<script lang="ts">
  import type { Reply } from '$lib/models';
  import { getUserPrivilege, parseDateTime } from '$lib/utils';
  import { page } from '$app/stores';
  import Like from './Like.svelte';
  import Delete from './Delete.svelte';
  import User from './User.svelte';
  import { richtext } from '$lib/richtext';

  $: ({ api, user } = $page.data);

  export let reply: Reply;
  export let replyTo: (reply: Reply) => void;

  $: content = richtext(reply.content, api);
</script>

<li class="max-w-full">
  <div class="flex w-full">
    <User id={reply.user} kind="embedded-mini" />
    <div
      class="ml-2 w-3/4 min-w-fit content"
      on:click={() => {
        replyTo(reply);
      }}
      on:keyup
    >
      {@html $content}
    </div>
    <p
      class="w-1/6 min-w-fit text-sm opacity-70 overflow-hidden"
      on:click={() => {
        replyTo(reply);
      }}
      on:keyup
    >
      {parseDateTime(reply.creation)}
    </p>
    <div class="min-w-fit text-right flex items-center gap-1">
      {#if user && (getUserPrivilege(user.type) >= 4 || user.id === reply.user)}
        <Delete target={reply} class="btn-sm" />
      {/if}
      <Like
        id={reply.like}
        likes={reply.like_count}
        type="reply"
        target={reply.id}
        class="btn-sm"
      />
    </div>
  </div>
</li>
