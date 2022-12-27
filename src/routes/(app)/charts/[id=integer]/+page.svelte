<script lang="ts">
	import { Status } from "$lib/constants";
	import { locale, t } from "$lib/translations/config";
	import {
		convertDuration,
		parseCharter,
		parseDuration,
		parseLyrics,
	} from "$lib/utils";
	import * as api from "$lib/api";
	import { onMount } from "svelte";
	import type { Comment } from "$lib/models";
	import CommentCard from "$lib/components/comment.svelte";
	import Song from "$lib/components/song.svelte";
	import { browser } from "$app/environment";
	import { Chart, registerables } from "chart.js";
  import User from "$lib/components/user.svelte";
	export let data: import("./$types").PageData;
	$: ({
		status,
		content,
		error,
		userRelation,
		comments,
		previousComments,
		nextComments,
		token,
		user
	} = data);

	let followed = false,
		fans = 0,
		comment = "",
		page = 1,
		isCommentLoaded = true;

	onMount(() => {
		if (status === Status.OK && content) {
			followed = userRelation ? userRelation.count !== 0 : false;
			fans = typeof content.owner === "object" ? content.owner.fans : 0;
			console.log(comments);
		}
		if (browser) {
			const chartData = {
				labels: [
					$t("chart.arrangement"),
					$t("chart.feel"),
					$t("chart.vfx"),
					$t("chart.innovativeness"),
					$t("chart.concord"),
				],
				datasets: [
					{
						label: `${$t("chart.rating")}`,
						data: [
							content?.r_arrangement,
							content?.r_feel,
							content?.r_vfx,
							content?.r_innovativeness,
							content?.r_concord,
						],
						backgroundColor: ["rgba(255, 155, 132, 0.2)"],
						borderColor: ["rgba(255, 99, 132, 1)"],
						borderRadius: 4,
						borderWidth: 2,
					},
				],
			};
			Chart.defaults.font.family = "'Saira', sans-serif";
			Chart.defaults.font.size = 12;
			new Chart(radarChartElement, {
				type: "radar",
				data: chartData,
				options: {
					plugins: {
						legend: {
							display: false,
						},
					},
				},
			});
		}
	});

	const follow = async () => {
		if (typeof content?.owner === "object") {
			followed = true;
			fans++;
			const resp = await api.POST(
				"relations/",
				{
					followee: content.owner.id,
					operation: 0,
				},
				token, user
			);
			if (!resp.ok) {
				console.log(await resp.json());
			}
		}
	};

	const unfollow = async () => {
		if (typeof content?.owner === "object") {
			followed = false;
			fans--;
			const resp = await api.POST(
				"relations/",
				{
					followee: content.owner.id,
					operation: 1,
				},
				token, user
			);
			if (!resp.ok) {
				console.log(await resp.json());
			}
		}
	};

	const sendComment = async () => {
		if (content && comment && comment.length > 0) {
			await api.POST(
				`comments/`,
				{ song: content.id, content: comment, language: locale.get() },
				token, user
			);
			comment = "";
			getComments(page);
		}
	};

	const getComments = async (page?: number) => {
		if (content) {
			isCommentLoaded = false;
			const resp = await api.GET(
				`comments/?song=${content.id}${page ? `&page=${page}` : ""}`,
				token, user
			);
			const json = await resp.json();
			comments = json.results;
			previousComments = json.previous;
			nextComments = json.next;
			console.log(json);
			isCommentLoaded = true;
		}
	};

	let radarChartElement: HTMLCanvasElement;

	Chart.register(...registerables);
</script>

{#if status === Status.OK && content !== null && typeof content.song === "object"}
	<div class="bg-base-200 py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[540px] main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("chart.chart")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-2xl bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex items-center">
							{content.song.name}
							<div
								class="ml-3 badge badge-lg badge-primary min-w-fit h-10 text-2xl"
							>
								{content.level}
								{content.difficulty.toString().split(".")[0]}
							</div>
							{#if content.ranked}
								<div
									class="ml-3 badge badge-lg badge-secondary min-w-fit h-8 text-lg"
								>
									{$t("chart.ranked")}
								</div>
							{/if}
						</div>
						<div class="flex">
							<div class="w-1/2">
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.level")}</span
									>
									{content.level}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.difficulty")}</span
									>
									{content.difficulty}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.charter")}</span
									>
									{#each parseCharter(content.charter) as t}
										{#if t.id > 0}
											<a
												href={`/users/${t.id}`}
												class="text-accent hover:underline">{t.text}</a
											>
										{:else}
											{t.text}
										{/if}
									{/each}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.notes")}</span
									>
									{content.notes}
								</p>
								{#if content.description}
									<p>
										<span class="badge badge-primary badge-outline mr-1"
											>{$t("common.description")}</span
										>
										{content.description}
									</p>
								{/if}
							</div>
							<div class="divider divider-horizontal" />
							<div class="w-1/2 float-right p-4">
								<canvas bind:this={radarChartElement} />
								<button class="btn btn-secondary">{$t("common.vote")}</button>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("common.comments")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-2xl bg-base-100">
					<div class="card-body py-10">
						<div class="flex items-center">
							<textarea
								class="mr-3 textarea textarea-primary w-11/12"
								placeholder={$t("common.write_comment")}
								bind:value={comment}
							/>
							<button
								class={`ml-3 btn ${
									comment.length > 0
										? "btn-outline btn-primary"
										: "btn-ghost btn-disabled"
								} w-1/12 min-w-fit`}
								on:click={() => {
									sendComment();
								}}>{$t("common.send")}</button
							>
						</div>
						{#if comments}
							{#if isCommentLoaded}
								{#each comments as comment}
									<CommentCard {comment} {token} {user} />
								{/each}
							{/if}

							<div class="bg-base-100 py-4 min-w-fit">
								<div class="btn-group flex justify-center min-w-fit mt-12">
									<button
										class={`btn text-4xl ${
											previousComments
												? "btn-primary btn-outline glass"
												: "btn-ghost btn-disabled"
										}`}
										on:click={() => {
											if (previousComments) {
												getComments(--page);
											}
										}}>«</button
									>
									<button
										class="btn btn-primary w-32 text-lg btn-active glass btn-disabled"
										>Page {page}</button
									>
									<button
										class={`btn text-4xl ${
											nextComments
												? "btn-primary btn-outline glass"
												: "btn-ghost btn-disabled"
										}`}
										on:click={() => {
											if (nextComments) {
												getComments(++page);
											}
										}}>»</button
									>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div class="mx-4 w-80 form-control">
			{#if typeof content.owner === "object"}
				<User {followed} user={content.owner} operator={user} {token}/>
			{/if}
			<div class="indicator my-4 w-full">
				<span
					class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("song.song")}</span
				>
				<Song song={content.song} />
			</div>
		</div>
	</div>
{/if}

<style>
	* {
		font-family: "Saira", sans-serif;
	}

	.main-width {
		width: calc(100% - 80px);
	}
</style>
