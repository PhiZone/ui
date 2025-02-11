<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Error from '$lib/components/Error.svelte';
  import Reply from '$lib/components/Reply.svelte';
  import { t } from '$lib/translations/config';

  export let data;

  $: ({ id, api } = data);

  $: query = createQuery(api.reply.info({ id }));
</script>

<svelte:head>
  <title>{$t('common.reply')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const reply = $query.data.data}
  <div class="hero min-h-screen bg-base-300">
    <div class="w-5/6 form-control mx-auto">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('common.reply')}
        </span>
        <Reply kind="full" {reply} />
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
