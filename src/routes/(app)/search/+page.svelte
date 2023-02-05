<script lang="ts">
	import { t } from "$lib/translations/config";
	import User from "$lib/components/user.svelte";
	import Song from "$lib/components/song.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { Status } from "$lib/constants";
	import { onMount } from "svelte";
	import Chapter from "$lib/components/chapter.svelte";
	import {
		afterNavigate,
		beforeNavigate,
		goto,
		preloadData,
	} from "$app/navigation";

	export let data: import("./$types").PageData;
	$: ({ status, type, name, content, error, access_token, user } = data);
	let results: any,
		count: number | null,
		page = 1,
		pageStatus = Status.RETRIEVING,
		previous: string | null,
		next: string | null,
		searchType: string | null = null,
		searchText: string | null,
		searchError = "";

	beforeNavigate(() => {
		results = null;
		page = 1;
		count = null;
		previous = null;
		next = null;
	});

	const callback = () => {
		pageStatus = status;
		searchType = type.toString();
		searchText = name;
		if (status === Status.OK && content) {
			results = content.results;
			count = content.count;
			previous = content.previous;
			next = content.next;
		} else {
			console.log("status", status);
			console.log("error", error);
		}
	};

	onMount(callback);
	afterNavigate(callback);

	const handleSearchType = (
		e: Event & { currentTarget: EventTarget & HTMLSelectElement }
	) => {
		searchType = (e.target as HTMLSelectElement).value;
	};

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleSearch = () => {
		if (!searchError) {
			if (!searchText) {
				searchError = "input_null";
			} else {
				pageStatus = Status.RETRIEVING;
				goto(
					`/search?type=${searchType}${searchText ? `&name=${searchText}` : ""}`
				);
			}
		}
	};
</script>

<svelte:head>
	<title>{$t("common.search")} | {$t("common.title")}</title>
</svelte:head>

<div class="bg-base-200 page">
	<div class="pt-32 pb-8 max-w-[60%] mx-auto form-control">
		<div class="form-control">
			<div class="input-group">
				<select
					class="select select-lg select-primary max-w-1/3 text-primary-content"
					on:change={(e) => {
						handleSearchType(e);
					}}
				>
					<option value="0" selected={type === 0}
						>{$t("common.chapters")}</option
					>
					<option value="1" selected={type === 1}>{$t("common.songs")}</option>
					<option value="2" selected={type === 2}>{$t("common.users")}</option>
					<!-- <option value="3">{$t("common.discussions")}</option> -->
				</select>
				<input
					type="text"
					placeholder={searchError
						? $t(`common.${searchError}`)
						: $t("common.search_placeholder")}
					class={`input input-lg w-full text-primary-content ${
						searchError ? "input-error" : "input-primary"
					}`}
					bind:value={searchText}
					on:input={() => {
						if (searchError === "input_null" && searchText) {
							searchError = "";
						}
						if (searchText && searchText.length > 100) {
							searchError = "text_too_long";
						} else if (searchError === "text_too_long") {
							searchError = "";
						}
					}}
					on:keyup={(e) => {
						handleKeyUp(e);
					}}
				/>
				{#if searchError}
					<button class="btn btn-lg btn-square btn-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/></svg
						>
					</button>
				{:else}
					<button
						class="btn btn-lg btn-square btn-primary"
						on:click={handleSearch}
						on:pointerenter={() => {
							if (!searchError && searchText) {
								preloadData(
									`/search?type=${searchType}${
										searchText ? `&name=${searchText}` : ""
									}`
								);
							}
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/></svg
						>
					</button>
				{/if}
			</div>
		</div>
	</div>
	{#if pageStatus === Status.OK && results}
		{#if results.length > 0 && count}
			<div class="px-32 result">
				{#each results as result}
					<div class="min-w-fit">
						{#if type === 0}
							<Chapter chapter={result} token={access_token} {user} />
						{:else if type === 1}
							<Song song={result} token={access_token} {user} />
						{:else if type === 2}
							<div class="w-80">
								<User
									user={result}
									token={access_token}
									operator={user}
									fixedHeight
								/>
							</div>
						{:else if type === 3}
							施工中（）
						{/if}
					</div>
				{/each}
			</div>
			<Pagination
				bind:previous
				bind:next
				bind:results
				bind:count
				bind:pageIndex
				bind:status
				token={access_token}
				{user}
			/>
		{:else if name}
			<p class="py-3 text-center">{$t("common.empty")}</p>
		{/if}
	{/if}
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
	.input {
		color: rgb(24, 24, 24);
		width: 100%;
	}
	.result {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		grid-gap: 1.5rem;
	}
</style>
