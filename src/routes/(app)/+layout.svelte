<script lang="ts">
	import "../../app.css";
	import Navbar from "$lib/components/navbar.svelte";
	import Footer from "$lib/components/footer.svelte";

	export let data: import("./$types").LayoutData;
	$: ({ user, backupUser } = data);
</script>

<Navbar user={user ? user : backupUser} />
<slot />
<Footer user={user ? user : backupUser} />
