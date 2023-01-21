<script lang="ts">
	import { t } from "$lib/translations/config";
	import { onMount } from "svelte";
	import { Status } from "$lib/constants";
	import Submission from "$lib/components/song_submission.svelte";
	import { getUserPrivilege } from "$lib/utils";
	import Pagination from "$lib/components/pagination.svelte";
	import type { SongSubmission } from "$lib/models";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, user, access_token } = data);

	let page = 1,
		submissionCount: number,
		pageStatus = Status.RETRIEVING,
		submissions: SongSubmission[],
		previousSubmissions: string,
		nextSubmissions: string;

	onMount(() => {
		pageStatus = status;
		if (status === Status.OK) {
			submissions = content.results;
			submissionCount = content.count;
			previousSubmissions = content.previous;
			nextSubmissions = content.next;
		} else {
			console.log("status:", status);
			console.log("error:", error);
		}
	});
</script>

<svelte:head>
	<title>
		{$t("common.studio")} - {$t("studio.song_submission")} | {$t(
			"common.title"
		)}
	</title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-7xl min-w-20">
			<div class="flex justify-between items-center mb-6">
				<h1 class="text-4xl font-bold">
					{$t("studio.song_submissions")}
				</h1>
				<a href="/studio/song-submissions/new">
					<button class="btn btn-accent text-lg btn-xl btn-outline glass ml-3">
						{$t("studio.upload_song")}
					</button>
				</a>
			</div>
			<div class="min-w-fit form-control gap-4">
				{#if pageStatus === Status.OK && submissions && submissions.length > 0}
					{#each submissions as submission}
						<Submission {submission} />
					{/each}
					<Pagination
						bind:previous={previousSubmissions}
						bind:next={nextSubmissions}
						bind:results={submissions}
						bind:count={submissionCount}
						bind:page
						bind:status={pageStatus}
						token={access_token}
						{user}
					/>
				{:else}
					<p class="pt-3 text-center">{$t("common.empty")}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
