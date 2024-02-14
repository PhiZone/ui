<script lang="ts">
  import { t } from '$lib/translations/config';
</script>

<svelte:head>
  <title>{$t('session.redirecting')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold my-4">{$t('session.redirecting')}</h1>
      <p class="text-lg py-6">{$t('session.redirection_description')}</p>
    </div>
  </div>
</div>
