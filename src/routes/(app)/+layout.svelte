<script>
    import '../../app.css';
    import Navbar from '$lib/components/navbar.svelte';
    import Footer from '$lib/components/footer.svelte';
    import { page } from '$app/stores';

    const user = $page.data.user;
</script>

<Navbar {user} />
<slot />
<!-- <select bind:value="{$locale}">
  {#each $locales as value}
    <option value="{value}">{$t(`lang.${value}`)}</option>
  {/each}
</select> -->
<Footer />
