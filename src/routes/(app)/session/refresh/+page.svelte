<script lang="ts">
	import { onMount } from "svelte";
	import { ContentType, Error } from "$lib/constants";
	import { error } from "@sveltejs/kit";
	import { goto } from "$app/navigation";
	import { page } from "$app/stores";
	import { POST } from "$lib/utils";

	export let data: import("./$types").PageData;
	$: ({ refresh_token } = data);

	onMount(async () => {
		const resp = await POST("/auth/refresh", {
			refresh_token,
		});
        const json = await resp.json();
		if (json.code === 200) {
			const redirect = $page.url.searchParams.get("redirect");
			goto(redirect ? redirect : "/");
		} else {
			try {
				if (json.content.error === Error.INVALID_GRANT) {
					goto("/session/login" + $page.url.search);
				} else {
					console.log("error", json.code, json.content);
					throw error(json.code, json.content.error_description);
				}
			} catch (e) {
				console.log("error", json.code, json.content);
				goto("/session/login" + $page.url.search);
			}
		}
	});
</script>

<svelte:head>
	<title>Redirection | PhiZone</title>
</svelte:head>
<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold my-4">Redirecting...</h1>
			<p class="text-lg py-6">Please wait while you're being redirected.</p>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
