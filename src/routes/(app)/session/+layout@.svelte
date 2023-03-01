<script>
  import '../../../app.css';
  import Navbar from '$lib/components/navbar.svelte';
  import Footer from '$lib/components/footer.svelte';
</script>

<Navbar showUser={false} user={undefined} />
<slot />
<Footer user={undefined} />
