<script lang="ts">
	import { Status } from "$lib/constants";
	import { locale, t } from "$lib/translations/config";
	import { parseDateTime } from "$lib/utils";
	import User from "$lib/components/user.svelte";
	import Chart from "$lib/components/chart.svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, grade, error, access_token, user } = data);
</script>

<svelte:head>
	<title>{$t("record.record")} | {$t("common.title")}</title>
</svelte:head>

{#if status === Status.OK && content !== null && typeof content.chart === "object" && typeof content.chart.song === "object" && grade !== null}
	<div class="bg-base-200 page py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-fit max-w-xl main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("record.record")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-1 flex gap-5 items-center font-bold">
							{content.score}
							<div
								class={`text-8xl font-normal grade ${
									grade == "P"
										? "top-11 text-yellow-400"
										: content.full_combo
										? "top-11 text-blue-400"
										: "top-11"
								}`}
							>
								{grade}
							</div>
						</div>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.acc")}</span
							>
							{(content.acc * 100).toFixed(2)}%
						</p>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.perfect")}</span
							>
							{content.perfect}
							<span class="opacity-70">
								(±{content.perfect_judgment}ms)
							</span>
						</p>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.good")}</span
							>
							{content.good_early + content.good_late} [E{content.good_early} · L{content.good_late}]
							<span class="opacity-70">
								(±{content.good_judgment}ms)
							</span>
						</p>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.bad")}</span
							>
							{content.bad}
						</p>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.miss")}</span
							>
							{content.miss}
						</p>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.rks")}</span
							>
							{content.rks.toFixed(3)}
						</p>
						<p>
							<span class="badge badge-primary badge-outline mr-1"
								>{$t("record.time")}</span
							>
							{parseDateTime(content.time)}
						</p>
					</div>
				</div>
			</div>
		</div>
		<div class="mx-4 w-80 form-control">
			{#if content.player && typeof content.player === "object"}
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("record.player")}</span
					>
					<User user={content.player} operator={user} token={access_token} />
				</div>
			{/if}
			{#if content.chart && typeof content.chart === "object"}
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("chart.chart")}</span
					>
					<Chart chart={content.chart} token={access_token} {user} />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
	.grade {
		font-family: "Black Ops One", cursive;
	}
	.main-width {
		width: calc(100% - 80px);
	}
</style>
