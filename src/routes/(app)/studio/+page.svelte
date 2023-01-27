<script lang="ts">
	import { t } from "$lib/translations/config";
</script>

<svelte:head>
	<title>{$t("common.studio")} | {$t("common.title")}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content w-full">
		<div class="w-5/6 form-control text-center">
			<h1 class="text-6xl font-bold">{$t("common.studio")}</h1>
			<p class="text-lg pt-6 whitespace-pre-wrap">
				{$t("studio.description")}
			</p>
			<a
				href="/studio_guide.html"
				class="text-lg hover:underline max-w-fit mx-auto my-3">{$t("studio.view_guide")}</a
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
