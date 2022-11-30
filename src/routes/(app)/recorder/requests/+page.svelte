<script lang="ts">
	import { t } from "$lib/translations/config";
	import * as api from "$lib/api";
	import { onMount } from "svelte";
	import { Status } from "$lib/constants";
	import Request from "$lib/components/recorder_request.svelte";
	import { getUserPrivilege } from "$lib/utils";
	export let data: import("./$types").PageData;
	$: ({ status, search, content, error, user, token } = data);

	let page = 1,
		requests: any,
		previousRequests: any,
		nextRequests: any;

	onMount(() => {
		if (status == Status.OK) {
			console.log("content:", content);
			requests = content.results;
			previousRequests = content.previous;
			nextRequests = content.next;
		} else {
			console.log("status:", status);
			console.log("error:", error);
		}
	});

	const getRequests = async (page?: number) => {
		const resp = await api.GET(
			`recorder/requests/${search}${search ? "&" : "?"}page=${page}`,
			token
		);
		const json = await resp.json();
		requests = json.results;
		previousRequests = json.previous;
		nextRequests = json.next;
		console.log(json);
	};
</script>

<div class="bg-base-100">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-6xl min-w-20">
			<h1 class="text-4xl font-bold mb-6">{$t(getUserPrivilege(user.type) >= 3 ? "recorder.manage" : "recorder.history")}</h1>
			<div class="py-4 min-w-fit">
				{#if requests && requests.length > 0}
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
					<div class="btn-group flex justify-center min-w-fit mt-12">
						<button
							class={`btn text-4xl ${
								previousRequests
									? "btn-primary btn-outline glass"
									: "btn-ghost btn-disabled"
							}`}
							on:click={() => {
								if (previousRequests) {
									getRequests(--page);
								}
							}}>«</button
						>
						<button
							class="btn btn-primary w-32 text-lg btn-active glass btn-disabled"
							>Page {page}</button
						>
						<button
							class={`btn text-4xl ${
								nextRequests
									? "btn-primary btn-outline glass"
									: "btn-ghost btn-disabled"
							}`}
							on:click={() => {
								if (nextRequests) {
									getRequests(++page);
								}
							}}>»</button
						>
					</div>
				{:else}
					<p class="text-gray text-lg">{$t('common.empty')}</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", sans-serif;
	}
</style>
