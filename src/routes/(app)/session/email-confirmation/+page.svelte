<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import type { PageData } from './$types';

  export let data: PageData;

  let code = data.code ?? '';
  let msg = data.detail ?? '';
  $: msg = data.detail ?? '';
  let valid = false;

  // $: valid = /^\d+$/.test(code) && code.length == 6;
  const oninput = () => {
    valid = /^\d+$/.test(code) && code.length == 6;
    msg = !valid && code ? $t('session.email_confirmation.code_not_numeric') : '';
  };

  $: if (browser && data.code && !data.detail) {
    setTimeout(async () => {
      $page.url.searchParams.delete('code');
      await goto('/session/login' + $page.url.search);
    }, 3000);
  }
</script>

<svelte:head>
  <title>{$t('session.email_confirmation.email_confirmation')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-4xl">
      {#if data.code && !data.detail}
        <h1 class="text-5xl font-bold">
          {$t('common.success')}
        </h1>
        <p class="py-6">
          {$t('session.registration.success')}
        </p>
      {:else}
        <h1 class="text-5xl font-bold">
          {$t('session.email_confirmation.email_confirmation')}
        </h1>
        <p class="py-6">
          {$t('session.email_confirmation.email_confirmation_text')}
        </p>
        <form>
          <input
            type="text"
            name="redirect"
            hidden
            value={$page.url.searchParams.get('redirect')}
          />
          <input
            type="text"
            id="code"
            name="code"
            class="input input-bordered input-lg input-{msg
              ? 'error'
              : valid
              ? 'success'
              : 'info'} w-full max-w-xs text-center glass"
            placeholder={$t('session.email_confirmation.code')}
            bind:value={code}
            on:input={oninput}
          />
          <div class="mt-6">
            <div
              class="tooltip tooltip-bottom tooltip-error"
              class:tooltip-open={msg}
              data-tip={msg || null}
            >
              <button
                type="submit"
                class="btn {msg ? 'btn-error' : 'btn-accent btn-outline'}"
                disabled={!valid}
              >
                {$t(msg ? 'common.error' : 'session.email_confirmation.activate')}
              </button>
            </div>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
