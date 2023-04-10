<script>
  import { t } from '$lib/translations/config';

  /** @type {import('./$types').PageData} */
  export let data;
  $: ({ status } = data);
</script>

<svelte:head>
  <title>{$t('challenge.title')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-3xl">
      <h1 class="text-5xl font-bold">{$t('challenge.title')}</h1>
      {#if status == 0}
        <p class="py-6 text-lg">{$t('challenge.description')}</p>
        <a href="/challenge/objective">
          <button class="btn btn-primary btn-outline text-xl glass">{$t('challenge.start')}</button>
        </a>
      {:else if status == 1}
        <p class="py-6 text-lg text-red-600">
          {$t('challenge.already_passed')}
        </p>
      {:else if status == 2}
        <p class="py-6 text-lg text-red-600">{$t('common.errors.401')}</p>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
