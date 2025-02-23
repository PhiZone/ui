<script lang="ts">
  import { page } from '$app/state';
  import Footer from '$lib/components/Footer.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { t } from '$lib/translations/config';

  let { children } = $props();

  let message = $derived(page.url.searchParams.get('message'));
  let translate = $derived(page.url.searchParams.get('t') === 'true');
  let level = $derived(
    ['info', 'success', 'warning', 'error'].includes(page.url.searchParams.get('level') as string)
      ? (page.url.searchParams.get('level') as string)
      : 'info',
  );
  let icon = $derived(
    {
      info: 'circle-info',
      success: 'circle-check',
      warning: 'triangle-exclamation',
      error: 'circle-xmark',
    }[level],
  );
  let closed = $state(false);
</script>

<Navbar />

{#if message && !closed}
  <div role="alert" class="fixed alert rounded-none alert-{level} top-16 z-[60]">
    <i class="fa-solid fa-{icon} fa-xl"></i>
    <span>{translate ? $t(message) : message}</span>
    <button
      class="btn btn-sm btn-circle btn-{level} border-2"
      onclick={() => {
        closed = true;
      }}
    >
      ✕
    </button>
  </div>
{/if}

<main class="bg-base-300">
  {@render children?.()}
</main>

{#if !page.url.pathname.startsWith('/studio')}
  <Footer />
{/if}
