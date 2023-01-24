<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import Chart from "$lib/components/chart.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { onMount } from "svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let page = 1,
		chartStatus = Status.RETRIEVING,
		charts: any[] | null,
		chartCount: number,
		previousCharts: string,
		nextCharts: string;

	onMount(() => {
		chartStatus = status;
		if (status === Status.OK) {
			charts = content.results;
			chartCount = content.count;
			previousCharts = content.previous;
			nextCharts = content.next;
		}
	});
</script>

<svelte:head>
	<title>{$t("common.charts")} | {$t("common.title")}</title>
</svelte:head>

<div class="pt-32 bg-base-200 page form-control justify-center">
	<h1 class="px-32 text-4xl font-bold mb-6">{$t("common.charts")}</h1>
	{#if chartStatus === Status.OK && charts}
		{#if charts.length > 0}
			<div class="px-32 result">
				{#each charts as chart}
					<div class="min-w-fit">
						<Chart {chart} token={access_token} {user} />
					</div>
				{/each}
			</div>
			<Pagination
				bind:previous={previousCharts}
				bind:next={nextCharts}
				bind:results={charts}
				bind:count={chartCount}
				bind:page
				bind:status={chartStatus}
				token={access_token}
				{user}
			/>
		{:else}
			<p class="py-3 text-center">{$t("common.empty")}</p>
		{/if}
	{/if}
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
	.result {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		grid-gap: 1.5rem;
	}
</style>
