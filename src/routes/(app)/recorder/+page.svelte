<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import { getUserPrivilege } from "$lib/utils";

	export let data: import("./$types").PageData;
	$: ({ status, content, user } = data);
	let array = [0, 1, 2, 3, 4];
</script>

<svelte:head>
	<title>{$t("recorder.request")} | {$t("common.title")}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content">
		<div class="w-5/6 form-control text-center">
			<h3 class="text-4xl font-bold">RPE Recorder</h3>
			<h1 class="text-6xl font-bold">{$t("recorder.recorder")}</h1>
			<p class="text-lg pt-6 text-left whitespace-pre-wrap">
				{$t("recorder.description")}
			</p>
			<div class="flex gap-5 max-w-fit mx-auto my-6">
				<a
					href="https://docs.qq.com/doc/DZGVDQVFUUVBXcW1D"
					target="_blank"
					rel="noreferrer"
					class="text-lg hover:underline">{$t("recorder.view_notice")}</a
				>
				<a
					href="https://docs.qq.com/doc/DZGdGRGd3S3RaZHpW"
					target="_blank"
					rel="noreferrer"
					class="text-lg hover:underline">{$t("recorder.view_guide")}</a
				>
			</div>
			{#if status === Status.OK && content}
				<div class="stats stats-horizontal shadow">
					{#each array as i}
						<div class="stat min-w-fit w-full max-w-[250px]">
							<div class="stat-title">{$t(`recorder.stat_statuses.${i}`)}</div>
							<div class="stat-value">{content.status[i]}</div>
						</div>
					{/each}
				</div>
			{/if}
			<div class="mt-3 flex justify-center">
				{#if user}
					{#if getUserPrivilege(user.type) >= 1}
						<a data-sveltekit-preload-data href="/recorder/requests/new"
							><button
								class="btn btn-primary text-lg btn-xl btn-outline glass mr-3"
								>{$t("recorder.new_request")}</button
							></a
						>
						<a data-sveltekit-preload-data href="/recorder/requests"
							><button
								class="btn btn-accent text-lg btn-xl btn-outline glass ml-3"
								>{getUserPrivilege(user.type) < 3
									? $t("recorder.view_history")
									: $t("recorder.manage")}</button
							></a
						>
					{:else}
						<p class="text-error">{$t("common.errors.403")}</p>
					{/if}
				{:else}
					<p class="text-error">{$t("common.errors.401")}</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
