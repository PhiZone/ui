<script lang="ts">
  import { onMount } from 'svelte';
  import { t } from '$lib/translations/config';
  import { Error } from '$lib/constants';
  import { error } from '@sveltejs/kit';
  import { page } from '$app/stores';
  import { POST } from '$lib/utils';
  import { browser } from '$app/environment';

  export let data: import('./$types').PageData;
  $: ({ refresh_token } = data);

  onMount(async () => {
    const resp = await POST('/auth/refresh', {
      refresh_token,
    });
    const json = await resp.json();
    if (json.code === 200) {
      if (browser) {
        const redirect = $page.url.searchParams.get('redirect');
        window.location.href = redirect ? redirect : '/';
      }
    } else {
      try {
        if (json.content.error === Error.INVALID_GRANT) {
          if (browser) {
            window.location.href = '/session/login' + $page.url.search;
          }
        } else {
          console.log('error', json.code, json.content);
          throw error(json.code, json.content.error_description);
        }
      } catch (e) {
        console.log('error', json.code, json.content);
        if (browser) {
          window.location.href = '/session/login' + $page.url.search;
        }
      }
    }
  });
</script>

<svelte:head>
  <title>{$t('session.redirecting')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-md">
      <h1 class="text-5xl font-bold my-4">{$t('session.redirecting')}</h1>
      <p class="text-lg py-6">{$t('session.redirection_description')}</p>
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
