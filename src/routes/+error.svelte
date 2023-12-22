<script>
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';

  let showMsg = [400, 401, 403, 404, 500, 502].includes($page.status);
</script>

<svelte:head>
  <title>
    {$page.status}
    {$page.error?.message} | {$t('common.title')}
  </title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-4xl form-control gap-4">
      <h1 class="text-6xl sm:text-8xl font-bold">{$page.status}</h1>
      {#if showMsg}
        <p class="text-xl sm:text-2xl">{$t(`common.errors.${$page.status}`)}</p>
      {/if}
      {#if $page.error?.message}
        <p class="sm:text-lg">{$t('common.error_msg')}{$page.error?.message}</p>
      {/if}
      <a href="/" class="btn border-2 normal-border btn-outline btn-lg m-2">
        {$t('common.back_to_homepage')}
      </a>
    </div>
  </div>
</div>
