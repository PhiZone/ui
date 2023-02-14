<script lang="ts">
	import { PAGINATION_PER_PAGE, Status } from "$lib/constants";
	import * as api from "$lib/api";
	import type { User } from "$lib/models";
	import { getPath } from "$lib/utils";
	import { t } from "$lib/translations/config";
	import { page } from "$app/stores";

	export let previous: string | null,
		next: string | null,
		results: any[] | null,
		count: number,
		status: Status,
		pageIndex: number,
		token: string | undefined,
		user: User;

	let preloaded: number | null = null,
		total = Math.ceil(count / PAGINATION_PER_PAGE),
		resp: { json: () => any; ok: any },
		nearbyPages = [
			...Array(
				pageIndex > 3
					? Math.min(pageIndex + 4, total + 1)
					: Math.min(total + 1, 8)
			).keys(),
		].slice(Math.max(1, pageIndex <= total - 3 ? pageIndex - 3 : total - 6)),
		allPages = [...Array(total + 1).keys()].slice(1);

	const preload = async (url: string, page: number) => {
		resp = await api.GET(getPath(url), token, user);
		preloaded = page;
	};

	const get = async (url: string, page: number) => {
		status = Status.RETRIEVING;
		results = null;
		if (preloaded === null || preloaded != page) {
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
		total = Math.ceil(count / PAGINATION_PER_PAGE);
		preloaded = null;
		setTimeout(() => {
			status = Status.OK;
		}, 1);
	};
</script>

<input type="checkbox" id="pagination" class="modal-toggle" />
<div class="modal">
	<div
		class={`modal-box bg-base-100 max-h-[90vh] ${
			$page.url.pathname.startsWith("/studio") ? "w-[40vw]" : "w-[70vw]"
		} max-w-[1800px]`}
	>
		<label
			for="pagination"
			class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
			>✕</label
		>
		<h2 class="font-bold text-xl mb-4">{$t("common.jump_to")}</h2>
		<div class="page-btn-grid">
			{#each allPages as p}
				<label
					for="pagination"
					class={`btn btn-sm btn-circle ${
						pageIndex == p ? "btn-disabled" : "btn-outline"
					}`}
					on:click={async () => {
						let url = next ? next : previous ? previous : null;
						if (url) {
							await get(url.replace(/page=\d+/, `page=${p}`), p);
							pageIndex = p;
							results = results;
							previous = previous;
							next = next;
						}
					}}
					on:pointerenter={() => {
						if (total > 20) {
							return;
						}
						let url = next ? next : previous ? previous : null;
						if (url) {
							preload(url.replace(/page=\d+/, `page=${p}`), p);
						}
					}}
					on:keyup>{p}</label
				>
			{/each}
		</div>
	</div>
</div>
{#if status === Status.OK && results && results.length > 0}
	<div
		class={`${
			$page.url.pathname.startsWith("/studio") ? "pt-4 pb-16" : "py-4"
		} min-w-fit flex justify-center`}
	>
		<div class="dropdown dropdown-hover dropdown-bottom w-full mt-3">
			<div class="btn-group flex justify-center">
				<button
					class={`btn text-4xl ${
						previous && status === Status.OK
							? "btn-primary btn-outline glass"
							: "btn-ghost btn-disabled"
					}`}
					on:click={() => {
						if (previous) {
							get(previous, --pageIndex);
						}
					}}
					on:pointerenter={() => {
						if (previous) {
							preload(previous, pageIndex - 1);
						}
					}}>«</button
				>
				<button
					class="btn btn-primary w-36 min-w-fit text-lg glass btn-active pointer-events-none"
					>Page {pageIndex} / {total}</button
				>
				<button
					class={`btn text-4xl ${
						next && status === Status.OK
							? "btn-primary btn-outline glass"
							: "btn-ghost btn-disabled"
					}`}
					on:click={() => {
						if (next) {
							get(next, ++pageIndex);
						}
					}}
					on:pointerenter={() => {
						if (next) {
							preload(next, pageIndex + 1);
						}
					}}>»</button
				>
			</div>
			{#if total > 1}
				<div
					tabindex="-1"
					class="dropdown-content menu menu-horizontal left-0 right-0 mx-auto btn-group btn-group-horizontal p-2 shadow bg-base-100 glass rounded-box"
				>
					{#each nearbyPages as p}
						<button
							class={`btn btn-sm ${
								pageIndex == p ? "btn-disabled" : "btn-outline"
							}`}
							on:click={async () => {
								let url = next ? next : previous ? previous : null;
								if (url) {
									await get(url.replace(/page=\d+/, `page=${p}`), p);
									pageIndex = p;
									results = results;
								}
							}}
							on:pointerenter={() => {
								let url = next ? next : previous ? previous : null;
								if (url) {
									preload(url.replace(/page=\d+/, `page=${p}`), p);
								}
							}}>{p}</button
						>
					{/each}
					<label for="pagination" class="btn btn-sm btn-outline">…</label>
				</div>
			{/if}
		</div>
	</div>
{:else if status === Status.RETRIEVING}
	<p class="py-3 text-center">{$t("common.loading")}</p>
{/if}

<style>
	.page-btn-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(25px, 1fr));
		grid-gap: 1rem;
	}
</style>
