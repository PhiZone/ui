<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import Chapter from "$lib/components/chapter.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { onMount } from "svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let page = 1,
		chapterStatus = Status.RETRIEVING,
		chapters: any[] | null,
		chapterCount: number,
		previousChapters: string,
		nextChapters: string;

	onMount(() => {
		chapterStatus = status;
		if (status === Status.OK) {
			chapters = content.results;
			chapterCount = content.count;
			previousChapters = content.previous;
			nextChapters = content.next;
		}
	});
</script>

<svelte:head>
	<title>{$t("common.chapters")} | {$t("common.title")}</title>
</svelte:head>

<div class="pt-32 bg-base-200 page form-control justify-center">
	<h1 class="px-32 text-4xl font-bold mb-6">{$t("common.chapters")}</h1>
	{#if chapterStatus === Status.OK && chapters}
		{#if chapters.length > 0}
			<div class="px-32 result">
				{#each chapters as chapter}
					<div class="min-w-fit">
						<Chapter {chapter} token={access_token} {user} fixedHeight />
					</div>
				{/each}
			</div>
			<Pagination
				bind:previous={previousChapters}
				bind:next={nextChapters}
				bind:results={chapters}
				bind:count={chapterCount}
				bind:page
				bind:status={chapterStatus}
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
