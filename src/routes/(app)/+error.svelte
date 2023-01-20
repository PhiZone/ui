<script>
	import { page } from "$app/stores";
	import { t } from "$lib/translations/config";

	let showMsg = [400, 401, 403, 404].includes($page.status);
</script>

<svelte:head>
	<title>
		{$page.status}
		{$page.error?.message} | {$t("common.title")}
	</title>
</svelte:head>

<div class="hero page bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-4xl form-control gap-4">
			<h1 class="text-8xl font-bold">{$page.status}</h1>
			{#if showMsg}
				<p class="text-2xl">{$t(`common.errors.${$page.status}`)}</p>
			{/if}
			{#if $page.error?.message}
				<p class="text-lg">{$t("common.error_msg")}{$page.error?.message}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
