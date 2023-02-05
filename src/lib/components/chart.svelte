<script lang="ts">
	import type { Chart, User } from "$lib/models";
	import { t } from "$lib/translations/config";
	import { getCompressedImage, getLevelColor, parseRichText } from "$lib/utils";
	import Like from "./like.svelte";

	export let chart: Chart, token: string | undefined, user: User;
</script>

{#if typeof chart.song == "object"}
	<div class="card w-80 bg-base-100 shadow-lg glass overflow-hidden">
		<a data-sveltekit-preload-data href={`/charts/${chart.id}`}>
			<figure class="h-[180px] relative">
				<img
					src={getCompressedImage(chart.song.illustration)}
					alt="Illustration"
					class="object-fill"
				/>
				<div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
					<div class="btn-group btn-group-horizontal">
						<button
							class={`btn ${getLevelColor(
								chart.level_type
							)} text-xl no-animation`}
						>
							{chart.level}
							{Math.floor(chart.difficulty)}
						</button>
						{#if chart.ranked}
							<button class="btn btn-primary btn-sm text-xl no-animation">
								{$t("chart.ranked")}
							</button>
						{/if}
					</div>
				</div>
			</figure>
			<div class="card-body gap-0.5">
				<h2
					class="title w-full whitespace-nowrap overflow-hidden text-ellipsis"
				>
					{chart.song.name}
				</h2>
				<p class="whitespace-nowrap overflow-hidden text-ellipsis">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("chart.charter")}</span
					>{#if chart.charter}
						{#each parseRichText(chart.charter) as t}
							{#if t.id > 0 && chart.collab_status}
								<a
									data-sveltekit-preload-data
									href={`/users/${t.id}`}
									class="text-accent hover:underline">{t.text}</a
								>
							{:else}
								{t.text}
							{/if}
						{/each}
					{:else}
						{$t("common.anonymous")}
					{/if}
				</p>
				<p class="whitespace-nowrap overflow-hidden text-ellipsis">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("chart.notes")}</span
					>{chart.notes}
				</p>
				<p class="whitespace-nowrap overflow-hidden text-ellipsis">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("chart.score")}</span
					>{chart.score.toFixed(2)}
				</p>
				<p class="whitespace-nowrap overflow-hidden text-ellipsis">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("chart.rating")}</span
					>{chart.rating.toFixed(2)}
				</p>
				{#if chart.owner && typeof chart.owner === "object"}
					<p class="whitespace-nowrap overflow-hidden text-ellipsis">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("chart.owner")}</span
						>{chart.owner.username}
					</p>
				{/if}
				<p />
				<div class="card-actions flex items-center justify-end">
					<div
						on:click={(e) => {
							e.preventDefault();
						}}
						on:keyup
					>
						<Like
							id={chart.like}
							likes={chart.like_count}
							type={"chart"}
							target={chart.id}
							{token}
							{user}
							css="sm"
						/>
					</div>
				</div>
			</div>
		</a>
	</div>
{/if}

<style>
	.title {
		gap: 0.5rem /* 8px */;
		font-size: 1.25rem /* 20px */;
		line-height: 1.75rem /* 28px */;
		font-weight: 600;
		margin-bottom: 4px;
	}
</style>
