<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Collaboration from '$lib/components/collaboration.svelte';

  export let data;

  $: ({ searchParams, id, api } = data);

  $: query = createQuery(api.collaboration.info({ id }));
</script>

<svelte:head>
  <title>{$t('studio.collaboration')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="w-5/6 form-control mx-auto max-w-[1200px]">
    {#if $query.isSuccess}
      {@const collaboration = $query.data.data}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('studio.collaboration')}
        </span>
        <Collaboration {collaboration} />
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
