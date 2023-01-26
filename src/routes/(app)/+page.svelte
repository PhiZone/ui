<script lang="ts">
	import { goto, preloadData } from "$app/navigation";
	import { t } from "$lib/translations/config";

	export let data: import("./$types").PageData;
	$: ({ status, content } = data);

	let searchText = "",
		error = "",
		searchType = "0";

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
		if (!error) {
			if (!searchText) {
				error = "input_null";
			} else {
				goto(
					`/search?type=${searchType}${searchText ? `&name=${searchText}` : ""}`
				);
			}
		}
	};
</script>

<svelte:head>
	<title>{$t("common.title")}</title>
</svelte:head>

{#if status === 200 && content}
	<div class="flex justify-center">
		<div class="alert w-fit alert-info shadow-lg top-20 fixed mx-8">
			<div>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					class="stroke-current flex-shrink-0 w-6 h-6"
					><path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/></svg
				>
				<span>{content.message}</span>
			</div>
		</div>
	</div>
{/if}

<div class="hero min-h-screen" style="background-image: url(/background.webp);">
	<div class="hero-overlay bg-opacity-50" />
	<div class="w-5/6 max-w-4xl form-control text-center text-neutral-content">
		<img class="logo" src="/favicon.ico" alt="logo" />
		<h1 class="mb-5 text-7xl font-bold">{$t("common.title")}</h1>
		<p class="mb-5 text-lg">
			{$t("home.description")}
		</p>
		<div class="form-control">
			<div class="input-group">
				<select
					class="select select-lg select-primary max-w-1/3 text-primary-content bg-opacity-80"
					on:change={(e) => {
						handleSearchType(e);
					}}
				>
					<option selected value="0">{$t("common.chapters")}</option>
					<option value="1">{$t("common.songs")}</option>
					<option value="2">{$t("common.users")}</option>
					<!-- <option value="3">{$t("common.discussions")}</option> -->
				</select>
				<input
					type="text"
					placeholder={error
						? $t(`common.${error}`)
						: $t("common.search_placeholder")}
					class={`input input-lg w-full bg-opacity-80 text-primary-content ${
						error ? "input-error" : "input-primary"
					}`}
					bind:value={searchText}
					on:input={() => {
						if (error === "input_null" && searchText) {
							error = "";
						}
						if (searchText.length > 100) {
							error = "text_too_long";
						} else if (error === "text_too_long") {
							error = "";
						}
					}}
					on:keyup={(e) => {
						handleKeyUp(e);
					}}
				/>
				{#if error}
					<button class="btn btn-lg btn-square btn-error bg-opacity-80">
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
						class="btn btn-lg btn-square btn-primary bg-opacity-80"
						on:click={handleSearch}
						on:pointerenter={() => {
							if (!error && searchText) {
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
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
	.logo {
		margin: 10px auto 20px;
		display: block;
	}
	.w {
		width: 80%;
		max-width: 850px;
	}
</style>
