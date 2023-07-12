<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Comment from '$lib/components/Comment.svelte';

  export let data;

  $: ({ searchParams, id, api } = data);

  $: query = createQuery(api.comment.info({ id }));
</script>

<svelte:head>
  <title>{$t('common.comment')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="w-5/6 form-control mx-auto">
    {#if $query.isSuccess}
      {@const comment = $query.data}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('common.comment')}
        </span>
        <Comment {searchParams} {comment} showSource />
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
