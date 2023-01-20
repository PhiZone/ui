<script lang="ts">
	import { t } from "$lib/translations/config";
	import { onMount } from "svelte";
	import { Status } from "$lib/constants";
	import Request from "$lib/components/recorder_request.svelte";
	import { getUserPrivilege } from "$lib/utils";
	import Pagination from "$lib/components/pagination.svelte";
	import type { RecorderRequest } from "$lib/models";
	export let data: import("./$types").PageData;
	$: ({ status, search, content, error, user, access_token } = data);

	let page = 1,
		requestCount: number,
		pageStatus = Status.RETRIEVING,
		requests: RecorderRequest[],
		previousRequests: string,
		nextRequests: string;

	onMount(() => {
		pageStatus = status;
		if (status === Status.OK) {
			console.log("content:", content);
			requests = content.results;
			requestCount = content.count;
			previousRequests = content.previous;
			nextRequests = content.next;
		} else {
			console.log("status:", status);
			console.log("error:", error);
		}
	});
</script>

<svelte:head>
	<title>
		{$t("recorder.request")} - {$t(
			user && getUserPrivilege(user.type) >= 3 ? "recorder.manage" : "recorder.history"
		)} | {$t("common.title")}
	</title>
</svelte:head>

<div class="bg-base-200 page">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-7xl min-w-20">
			<h1 class="text-4xl font-bold mb-6">
				{$t(
					user && getUserPrivilege(user.type) >= 3
						? "recorder.manage"
						: "recorder.history"
				)}
			</h1>
			<div class="min-w-fit form-control gap-4">
				{#if pageStatus === Status.OK && requests && requests.length > 0}
					{#each requests as request}
						<Request
							id={request.id}
							name={request.name}
							illustration={request.illustration}
							level={request.level}
							difficulty={request.difficulty}
							status={request.status}
							showUser={getUserPrivilege(user.type) >= 3}
							user={request.user}
							replier={request.replier}
							requested_at={request.requested_at}
							replied_at={request.replied_at}
						/>
					{/each}
					<Pagination
						bind:previous={previousRequests}
						bind:next={nextRequests}
						bind:results={requests}
						bind:count={requestCount}
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

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
