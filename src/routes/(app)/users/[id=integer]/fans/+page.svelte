<script lang="ts">
	import { Status } from "$lib/constants";
	import { locale, t } from "$lib/translations/config";
	import Relation from "$lib/components/user.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { onMount } from "svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let page = 1,
		relationStatus = Status.RETRIEVING,
		relations: any[] | null,
		relationCount: number,
		previousRelations: string,
		nextRelations: string;

	onMount(() => {
		relationStatus = status;
		if (status === Status.OK) {
			relations = content.results;
			relationCount = content.count;
			previousRelations = content.previous;
			nextRelations = content.next;
		}
	});
</script>

<svelte:head>
	<title>{$t("common.relations")} | {$t("common.title")}</title>
</svelte:head>

<div class="pt-32 bg-base-200 page form-control justify-center">
	<h1 class="px-32 text-4xl font-bold mb-6">{$t("user.fans")}</h1>
	{#if relationStatus === Status.OK && relations}
		{#if relations.length > 0}
			<div class="px-32 result">
				{#each relations as relation}
					<div class="min-w-fit w-80">
						<Relation
							user={relation.follower}
							token={access_token}
							operator={user}
							fixedHeight
						/>
					</div>
				{/each}
			</div>
			<Pagination
				bind:previous={previousRelations}
				bind:next={nextRelations}
				bind:results={relations}
				bind:count={relationCount}
				bind:page
				bind:status={relationStatus}
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
