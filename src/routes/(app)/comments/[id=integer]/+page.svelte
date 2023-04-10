<script lang="ts">
  import Comment from '$lib/components/Comment.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  export let data: import('./$types').PageData;
  $: ({ status, content, error, access_token, user } = data);
</script>

<svelte:head>
  <title>{$t('common.comment')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="w-5/6 form-control mx-auto">
    {#if status === Status.OK && content}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('common.comment')}
        </span>
        <Comment comment={content} token={access_token} {user} showSource />
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
