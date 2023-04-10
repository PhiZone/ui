<script lang="ts">
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Navbar />

<main class="bg-base-200">
  <slot />
</main>

{#if !$page.url.pathname.startsWith('/studio') && $page.status < 400}
  <Footer />
{/if}
