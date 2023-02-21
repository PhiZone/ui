<script lang="ts">
	import { goto, preloadData } from "$app/navigation";
	import type { User, Record, Chart } from "$lib/models";
	import { t } from "$lib/translations/config";
	import {
		getCompressedImage,
		getGrade,
		getLevelColor,
		parseDateTime,
	} from "$lib/utils";

	export let record: Record,
		chart: Chart | undefined = undefined,
		pos: number | undefined = undefined,
		showChart = true;
	const grade = getGrade(record.score, record.full_combo);
</script>

<div
	class={`card m-1 w-[288px] ${
		typeof record.player == "object" ? "h-40" : "h-36"
	} card-side relative bg-base-100 shadow-lg glass overflow-hidden`}
>
	<a class="w-fit h-fit" href={`/records/${record.id}`}>
		{#if typeof record.chart === "object" && typeof record.chart.song === "object"}
			<img
				class="object-fill w-full h-full blur opacity-40"
				src={getCompressedImage(record.chart.song.illustration)}
				alt="Illustration"
			/>
		{:else if chart && typeof chart.song === "object"}
			<img
				class="object-fill w-full h-full blur opacity-40"
				src={getCompressedImage(chart.song.illustration)}
				alt="Illustration"
			/>
		{/if}
		<div
			class={`absolute left-6 text-7xl grade ${
				grade == "P"
					? "top-11 text-yellow-400"
					: record.full_combo
					? "top-11 text-blue-400"
					: "top-11"
			}`}
		>
			{grade}
		</div>
		<div class="absolute right-2 top-2 form-control justify-end">
			{#if showChart && typeof record.chart === "object" && typeof record.chart.song === "object"}
				<div class="btn-group btn-group-horizontal w-[272px] justify-end">
					<button
						class="btn song flex-shrink btn-xs btn-outline justify-start text-sm no-animation whitespace-nowrap overflow-hidden text-ellipsis"
						on:click={(e) => {
							e.preventDefault();
							goto(
								typeof record.chart === "object" &&
									typeof record.chart.song === "object"
									? `/songs/${record.chart.song.id}`
									: "#"
							);
						}}
						on:pointerenter={() => {
							preloadData(
								typeof record.chart === "object" &&
									typeof record.chart.song === "object"
									? `/songs/${record.chart.song.id}`
									: "#"
							);
						}}
					>
						{record.chart.song.name}
					</button>
					<button
						class={`btn ${getLevelColor(
							record.chart.level_type
						)} btn-xs text-sm no-animation`}
						on:click={(e) => {
							e.preventDefault();
							goto(
								`/charts/${
									typeof record.chart === "object"
										? record.chart.id
										: record.chart
								}`
							);
						}}
						on:pointerenter={() => {
							preloadData(
								`/charts/${
									typeof record.chart === "object"
										? record.chart.id
										: record.chart
								}`
							);
						}}
					>
						{record.chart.level}
						{record.chart.difficulty != 0 ? Math.floor(record.chart.difficulty) : "?"}
					</button>
				</div>
			{:else if pos}
				<div class="btn-group btn-group-horizontal w-[272px] justify-start">
					<button class="btn btn-secondary btn-xs text-sm no-animation">
						#{pos}
					</button>
				</div>
			{/if}
			<h2 class="mt-1 font-bold text-3xl h-8 text-right">
				{record.score}
			</h2>
			<p class="text-xl h-[26px] text-right">
				{(record.acc * 100).toFixed(2)}%
			</p>
			<p class="text-right h-5">
				P{record.perfect} · G{record.good_early + record.good_late} · B{record.bad}
				· M{record.miss}
			</p>
		</div>
		<div class="absolute right-2 bottom-2 form-control justify-end">
			<p class="text-right player">
				{#if typeof record.player == "object"}
					<a href={`/users/${record.player.id}`} class="hover:underline">
						{$t(record.player.username)}
					</a>
					@
				{/if}
				{parseDateTime(record.time)}
			</p>
		</div>
	</a>
</div>

<style>
	.song {
		text-transform: none;
	}
	.grade {
		font-family: "Black Ops One", cursive;
	}
	.player {
		line-height: 16px;
	}
</style>
