<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import Song from "$lib/components/song.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { onMount } from "svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let page = 1,
		songStatus = Status.RETRIEVING,
		songs: any[] | null,
		songCount: number,
		previousSongs: string,
		nextSongs: string;

	onMount(() => {
		songStatus = status;
		if (status === Status.OK) {
			songs = content.results;
			songCount = content.count;
			previousSongs = content.previous;
			nextSongs = content.next;
		}
	});
</script>

<svelte:head>
	<title>{$t("common.songs")} | {$t("common.title")}</title>
</svelte:head>

<div class="pt-32 bg-base-200 page form-control justify-center">
	<h1 class="px-32 text-4xl font-bold mb-6">{$t("common.songs")}</h1>
	{#if songStatus === Status.OK && songs}
		{#if songs.length > 0}
			<div class="px-32 result">
				{#each songs as song}
					<div class="min-w-fit">
						<Song {song} token={access_token} {user} />
					</div>
				{/each}
			</div>
			<Pagination
				bind:previous={previousSongs}
				bind:next={nextSongs}
				bind:results={songs}
				bind:count={songCount}
				bind:page
				bind:status={songStatus}
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
