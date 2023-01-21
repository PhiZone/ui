<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import Record from "$lib/components/record.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { onMount } from "svelte";
	import { browser } from "$app/environment";
	import { goto } from "$app/navigation";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let page = 1,
		recordStatus = Status.RETRIEVING,
		records: any[] | null,
		recordCount: number,
		previousRecords: string,
		nextRecords: string;

	onMount(() => {
		recordStatus = status;
		if (status === Status.OK) {
			records = content.results;
			recordCount = content.count;
			previousRecords = content.previous;
			nextRecords = content.next;
		} else if (status === Status.ERROR && !access_token && browser) {
			goto(
				`/session/login/?redirect=${encodeURIComponent(
					window.location.pathname + window.location.search
				)}`
			);
		}
	});
</script>

<svelte:head>
	<title>{$t("common.records")} | {$t("common.title")}</title>
</svelte:head>

<div class="pt-32 bg-base-200 page form-control justify-center">
	<h1 class="px-32 text-4xl font-bold mb-6">{$t("common.records")}</h1>
	{#if recordStatus === Status.OK && records}
		{#if records.length > 0}
			<div class="px-32 result">
				{#each records as record}
					<div class="min-w-fit">
						<Record {record} />
					</div>
				{/each}
			</div>
			<Pagination
				bind:previous={previousRecords}
				bind:next={nextRecords}
				bind:results={records}
				bind:count={recordCount}
				bind:page
				bind:status={recordStatus}
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
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		grid-gap: 1rem;
	}
</style>
