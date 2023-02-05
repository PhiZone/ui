<script lang="ts">
	import { t } from "$lib/translations/config";

	export let data: import("./$types").PageData;
	$: ({ status, content } = data);
</script>

<svelte:head>
	<title>{$t("common.studio")} | {$t("common.title")}</title>
</svelte:head>

{#if status === 200 && content}
	<div class="flex justify-center">
		<div class="alert w-fit alert-info shadow-lg top-20 fixed mx-8">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current flex-shrink-0 w-6 h-6"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span class="content">{content.message}</span>
			</div>
		</div>
	</div>
{/if}

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content w-full">
		<div class="w-5/6 form-control text-center">
			<h1 class="text-6xl font-bold">{$t("common.studio")}</h1>
			<p class="text-lg pt-6 whitespace-pre-wrap">
				{$t("studio.description")}
			</p>
			<a
				href="/studio_guide.html"
				class="text-lg hover:underline max-w-fit mx-auto my-3"
				>{$t("studio.view_guide")}</a
			>
			<div class="mt-3 flex justify-center">
				<a data-sveltekit-preload-data href="/studio/chart-submissions/new">
					<button class="btn btn-primary text-lg btn-xl btn-outline glass mr-3">
						{$t("studio.upload_chart")}
					</button>
				</a>
				<a data-sveltekit-preload-data href="/studio/song-submissions/new">
					<button class="btn btn-accent text-lg btn-xl btn-outline glass ml-3">
						{$t("studio.upload_song")}
					</button>
				</a>
			</div>
		</div>
	</div>
</div>
