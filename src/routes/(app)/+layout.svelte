<script lang="ts">
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Navbar />

<main class="bg-base-300">
  <slot />
</main>

{#if !$page.url.pathname.startsWith('/studio')}
  <Footer />
{/if}
