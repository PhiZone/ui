<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import { useQueryClient } from '@tanstack/svelte-query';

  const build = (target: string | null) => {
    if (!target) return null;
    let targetUrl = new URL(target);

    for (let [key, value] of $page.url.searchParams.entries()) {
      if (key === 'uri') continue;
      targetUrl.searchParams.append(key, value);
    }
    return targetUrl.toString();
  };

  onMount(async () => {
    if (browser) {
      setTimeout(async () => {
        try {
          await Promise.allSettled([useQueryClient().invalidateQueries(), invalidateAll()]);
          await goto(build($page.url.searchParams.get('uri')) ?? '/');
        } catch (e) {
          window.location.href = build($page.url.searchParams.get('uri')) ?? '/';
        }
      }, 1000);
    }
  });
</script>

<svelte:head>
  <title>{$t('session.redirecting')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold my-4">{$t('session.redirecting')}</h1>
      <p class="text-lg py-6">{$t('session.redirection_description')}</p>
    </div>
  </div>
</div>
