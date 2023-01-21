<script lang="ts">
	import type { Song, User } from "$lib/models";
	import { t } from "$lib/translations/config";
	import { convertDuration, getCompressedImage } from "$lib/utils";
	import Like from "./like.svelte";

	export let song: Song, token: string | undefined, user: User;

	let easyCount = song.levels.find((e) => {
			return e.level === "EZ";
		})?.count,
		hardCount = song.levels.find((e) => {
			return e.level === "HD";
		})?.count,
		insaneCount = song.levels.find((e) => {
			return e.level === "IN";
		})?.count,
		anotherCount = song.levels.find((e) => {
			return e.level === "AT";
		})?.count,
		specialCount = song.levels.find((e) => {
			return e.level === "SP";
		})?.count,
		otherCount = song.levels.length
			? (typeof song.charts == "object" ? song.charts.length : song.charts) -
			  (easyCount ? easyCount : 0) -
			  (hardCount ? hardCount : 0) -
			  (insaneCount ? insaneCount : 0) -
			  (anotherCount ? anotherCount : 0) -
			  (specialCount ? specialCount : 0)
			: 0;
</script>

<div class="card w-80 bg-base-100 shadow-lg glass overflow-hidden">
	<a data-sveltekit-preload-data href={`/songs/${song.id}`}>
		<figure class="h-[180px] relative">
			<img
				src={getCompressedImage(song.illustration)}
				alt="Illustration"
				class="object-fill"
			/>
			{#if song.original}
				<div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
					<button class="btn btn-secondary btn-sm text-xl no-animation">
						{$t("song.original")}
					</button>
				</div>
			{/if}
		</figure>
		<div class="card-body gap-0.5">
			<h2 class="title w-full whitespace-nowrap overflow-hidden text-ellipsis">
				{song.name}
			</h2>
			<p class="whitespace-nowrap overflow-hidden text-ellipsis">
				<span class="badge badge-primary badge-outline mr-1"
					>{$t("song.composer")}</span
				>{song.composer}
			</p>
			<p class="whitespace-nowrap overflow-hidden text-ellipsis">
				<span class="badge badge-primary badge-outline mr-1"
					>{$t("song.edition")}</span
				>{song.edition}
			</p>
			<p class="whitespace-nowrap overflow-hidden text-ellipsis">
				<span class="badge badge-primary badge-outline mr-1"
					>{$t("song.illustrator")}</span
				>{song.illustrator}
			</p>
			<p class="whitespace-nowrap overflow-hidden text-ellipsis">
				<span class="badge badge-primary badge-outline mr-1"
					>{$t("song.bpm")}</span
				>{song.bpm}
			</p>
			<p class="whitespace-nowrap overflow-hidden text-ellipsis">
				<span class="badge badge-primary badge-outline mr-1"
					>{$t("song.duration")}</span
				>{convertDuration(song.duration)}
			</p>
			{#if typeof song.uploader === "object"}
				<p class="whitespace-nowrap overflow-hidden text-ellipsis">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t(song.original ? "song.author" : "song.uploader")}</span
					>{song.uploader.username}
				</p>
			{/if}
			<p />
			<div class="card-actions flex items-center justify-end">
				{#if easyCount}
					<a
						data-sveltekit-preload-data
						href={`/charts?song=${song.id}&level=EZ`}
					>
						<button class="btn btn-sm btn-primary btn-outline gap-2">
							EZ ({easyCount})
						</button>
					</a>
				{/if}
				{#if hardCount}
					<a
						data-sveltekit-preload-data
						href={`/charts?song=${song.id}&level=HD`}
					>
						<button class="btn btn-sm btn-primary btn-outline gap-2">
							HD ({hardCount})
						</button>
					</a>
				{/if}
				{#if insaneCount}
					<a
						data-sveltekit-preload-data
						href={`/charts?song=${song.id}&level=IN`}
					>
						<button class="btn btn-sm btn-primary btn-outline gap-2">
							IN ({insaneCount})
						</button>
					</a>
				{/if}
				{#if anotherCount}
					<a
						data-sveltekit-preload-data
						href={`/charts?song=${song.id}&level=AT`}
					>
						<button class="btn btn-sm btn-primary btn-outline gap-2">
							AT ({anotherCount})
						</button>
					</a>
				{/if}
				{#if specialCount}
					<a
						data-sveltekit-preload-data
						href={`/charts?song=${song.id}&level=SP`}
					>
						<button class="btn btn-sm btn-primary btn-outline gap-2">
							SP ({specialCount})
						</button>
					</a>
				{/if}
				{#if otherCount}
					<a data-sveltekit-preload-data href={`/charts?song=${song.id}`}>
						<button class="btn btn-sm btn-primary btn-outline gap-2">
							OTH ({otherCount})
						</button>
					</a>
				{/if}

				<div
					on:click={(e) => {
						e.preventDefault();
					}}
					on:keyup
				>
					<Like
						id={song.like}
						likes={song.like_count}
						type={"song"}
						target={song.id}
						{token}
						{user}
						css="sm"
					/>
				</div>
			</div>
		</div>
	</a>
</div>

<style>
	.title {
		gap: 0.5rem /* 8px */;
		font-size: 1.25rem /* 20px */;
		line-height: 1.75rem /* 28px */;
		font-weight: 600;
		margin-bottom: 4px;
	}
</style>
