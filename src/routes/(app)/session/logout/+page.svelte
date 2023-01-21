<script lang="ts">
	import { onMount } from "svelte";
	import { t } from "$lib/translations/config";
	import { page } from "$app/stores";
	import { POST } from "$lib/utils";

	export let data: import("./$types").PageData;
	$: ({ refresh_token } = data);

	onMount(async () => {
		POST("/auth/logout", {
			refresh_token,
		});
		const redirect = $page.url.searchParams.get("redirect");
		window.location.href = redirect ? redirect : "/";
	});
</script>

<svelte:head>
	<title>{$t("session.logging_out")} | {$t("common.title")}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-md">
			<h1 class="text-5xl font-bold my-4">{$t("session.logging_out")}</h1>
			<p class="text-lg py-6">{$t("session.redirection_description")}</p>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
