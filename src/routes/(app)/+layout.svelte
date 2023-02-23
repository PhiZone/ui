<script lang="ts">
  import '../../app.css';
  import Navbar from '$lib/components/navbar.svelte';
  import Footer from '$lib/components/footer.svelte';

  export let data: import('./$types').LayoutData;
  $: ({ user, backupUser, refresh_token } = data);
</script>

<Navbar user={refresh_token ? (user ? user : backupUser) : undefined} />
<slot />
<Footer user={refresh_token ? (user ? user : backupUser) : undefined} />
