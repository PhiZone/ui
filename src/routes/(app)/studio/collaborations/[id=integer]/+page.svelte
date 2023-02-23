<script lang="ts">
  import Collaboration from '$lib/components/collaboration.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  export let data: import('./$types').PageData;
  $: ({ status, content, error, access_token, user } = data);
</script>

<svelte:head>
  <title>{$t('studio.collaboration')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="w-5/6 form-control mx-auto max-w-[1200px]">
    {#if status === Status.OK && content}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
          >{$t('studio.collaboration')}</span
        >
        <Collaboration collaboration={content} token={access_token} {user} />
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
