<script lang="ts">
	import { PAGINATION_PER_PAGE, Status } from "$lib/constants";
	import * as api from "$lib/api";
	import type { User } from "$lib/models";
	import { getPath } from "$lib/utils";
	import { t } from "$lib/translations/config";

	export let previous: string | null,
		next: string | null,
		results: any[] | null,
		count: number,
		status: Status,
		page: number,
		token: string | undefined,
		user: User;

	let preloaded = false,
		resp: { json: () => any; ok: any };

	const preload = async (url: string) => {
		resp = await api.GET(getPath(url), token, user);
		preloaded = true;
	};

	const get = async (url: string) => {
		results = null;
		status = Status.RETRIEVING;
		if (!preloaded) {
			resp = await api.GET(getPath(url), token, user);
		}
		const json = await resp.json();
		if (!resp.ok) {
			status = Status.ERROR;
			console.log(json);
		}
		count = json.count;
		previous = json.previous;
		next = json.next;
		results = json.results;
		if (preloaded) {
			preloaded = false;
			setTimeout(() => {
				status = Status.OK;
			}, 1);
		} else {
			status = Status.OK;
		}
	};
</script>

{#if results && results.length > 0}
	<div class="py-4 min-w-fit">
		<div class="btn-group flex justify-center min-w-fit mt-3">
			<button
				class={`btn text-4xl ${
					previous && status === Status.OK
						? "btn-primary btn-outline glass"
						: "btn-ghost btn-disabled"
				}`}
				on:click={() => {
					if (previous) {
						get(previous);
						--page;
					}
				}}
				on:pointerenter={() => {
					if (previous) {
						preload(previous);
					}
				}}>«</button
			>
			<button
				class="btn btn-primary w-36 min-w-fit text-lg glass btn-active btn-disabled"
				>Page {page} / {Math.ceil(count / PAGINATION_PER_PAGE)}</button
			>
			<button
				class={`btn text-4xl ${
					next && status === Status.OK
						? "btn-primary btn-outline glass"
						: "btn-ghost btn-disabled"
				}`}
				on:click={() => {
					if (next) {
						get(next);
						++page;
					}
				}}
				on:pointerenter={() => {
					if (next) {
						preload(next);
					}
				}}>»</button
			>
		</div>
	</div>
{:else if status === Status.RETRIEVING}
	<p class="pt-3 text-center">{$t("common.loading")}</p>
{/if}
