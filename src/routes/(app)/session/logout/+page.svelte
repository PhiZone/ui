<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import { useQueryClient } from '@tanstack/svelte-query';

  onMount(async () => {
    if (browser) {
      setTimeout(async () => {
        try {
          await Promise.allSettled([useQueryClient().invalidateQueries(), invalidateAll()]);
          await goto($page.url.searchParams.get('redirect') ?? '/');
        } catch (e) {
          window.location.href = $page.url.searchParams.get('redirect') ?? '/';
        }
      }, 1000);
    }
  });
</script>

<svelte:head>
  <title>{$t('session.logging_out')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold my-4">{$t('session.logging_out')}</h1>
      <p class="text-lg py-6">{$t('session.redirection_description')}</p>
    </div>
  </div>
</div>
