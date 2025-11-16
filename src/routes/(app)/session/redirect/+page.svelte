<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query';
  import { onMount } from 'svelte';

  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/state';
  import { t } from '$lib/translations/config';
  import { PUBLIC_DOMAIN_ALLOWLIST } from '$env/static/public';

  const allowedDomains: string[] = JSON.parse(PUBLIC_DOMAIN_ALLOWLIST);

  const build = (target: string | null) => {
    if (!target) return null;
    let targetUrl = new URL(target);

    if (
      !allowedDomains.some((host) =>
        host[0] === '.'
          ? targetUrl.host.endsWith(host)
          : host[host.length - 1] === ':'
            ? targetUrl.host.startsWith(host)
            : targetUrl.host === host,
      )
    )
      return null;

    for (let [key, value] of page.url.searchParams.entries()) {
      if (key === 'uri') continue;
      targetUrl.searchParams.append(key, value);
    }
    return targetUrl.toString();
  };

  onMount(async () => {
    if (browser) {
      setTimeout(async () => {
        const dest = build(page.url.searchParams.get('uri')) ?? '/';
        try {
          await Promise.allSettled([useQueryClient().invalidateQueries(), invalidateAll()]);
          await goto(dest);
        } catch {
          window.location.href = dest;
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
