<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Comment from '$lib/components/Comment.svelte';
  import Error from '$lib/components/Error.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { searchParams, id, api } = $derived(data);

  let query = $derived(createQuery(api.comment.info({ id })));
</script>

<svelte:head>
  <title>{$t('common.comment')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const comment = $query.data.data}
  <div class="hero min-h-screen bg-base-300">
    <div class="w-5/6 form-control mx-auto">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('common.comment')}
        </span>
        <Comment {searchParams} {comment} showSource />
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
