<script lang="ts">
	import { Status } from "$lib/constants";
	import { locale, t } from "$lib/translations/config";
	import { getPath, getUserLevel, parseRichText } from "$lib/utils";
	import * as api from "$lib/api";
	import { onMount } from "svelte";
	import Comment from "$lib/components/comment.svelte";
	import Song from "$lib/components/song.svelte";
	import { browser } from "$app/environment";
	import { Chart, registerables } from "chart.js";
	import "chart.js/auto";
	import User from "$lib/components/user.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import Like from "$lib/components/like.svelte";
	import Record from "$lib/components/record.svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, commentRes, access_token, user } = data);

	const getMultiplier = (level: number) => {
		switch (level) {
			case 0:
				return 0.0;
			case 1:
				return 1.0;
			case 2:
				return 1.2;
			case 3:
				return 1.4;
			case 4:
				return 1.6;
			case 5:
				return 2.0;
			case 6:
				return 2.5;
			case 7:
				return 3.0;
			case 8:
				return 3.5;
			case 9:
				return 4.0;
			case 10:
				return 5.0;
		}
		return 0;
	};

	let comment = "",
		page = 1,
		commentStatus = Status.RETRIEVING,
		comments: any[] | null,
		commentCount: number,
		previousComments: string,
		nextComments: string,
		voteStatus = Status.OK,
		voteMsg = "",
		arrangement = 0,
		feel = 0,
		vfx = 0,
		innovativeness = 0,
		concord = 0,
		impression = 0,
		radarChartElement: HTMLCanvasElement,
		chart: Chart;

	onMount(() => {
		if (commentRes) {
			comments = commentRes.results;
			commentCount = commentRes.count;
			previousComments = commentRes.previous;
			nextComments = commentRes.next;
			commentStatus = Status.OK;
		}
		if (content && content.vote) {
			arrangement = content.vote.arrangement;
			feel = content.vote.feel;
			vfx = content.vote.visual_effects;
			innovativeness = content.vote.innovativeness;
			concord = content.vote.concord;
			impression = content.vote.impression;
		}
		if (status === Status.OK) {
			let chartData = {
				labels: [
					$t("chart.arrangement"),
					$t("chart.feel"),
					$t("chart.vfx"),
					$t("chart.innovativeness"),
					$t("chart.concord"),
					$t("chart.impression"),
				],
				datasets: [
					{
						label: `${$t("chart.rating")}`,
						data: [
							content?.r_arrangement.toFixed(2),
							content?.r_feel.toFixed(2),
							content?.r_vfx.toFixed(2),
							content?.r_innovativeness.toFixed(2),
							content?.r_concord.toFixed(2),
							content?.r_impression.toFixed(2),
						],
						backgroundColor: ["rgba(255, 155, 132, 0.2)"],
						borderColor: ["rgba(255, 99, 132, 1)"],
						borderRadius: 4,
						borderWidth: 2,
					},
				],
			};
			if (chartData.labels.length === 6 && chartData.labels[0] == "") {
				chartData.labels = [
					"Note Arrangement",
					"Feel",
					"Visual Effects",
					"Innovativeness",
					"Concord",
					"Impression",
				];
			}
			Chart.defaults.font.family = "'Saira', sans-serif";
			Chart.defaults.font.size = 12;
			if (chart instanceof Chart) {
				chart.destroy();
			}
			chart = new Chart(radarChartElement, {
				type: "radar",
				data: chartData,
				options: {
					scales: {
						r: {
							beginAtZero: true,
						},
					},
					plugins: {
						legend: {
							display: false,
						},
					},
				},
			});
		}
		return () => {
			if (chart instanceof Chart) {
				chart.destroy();
			}
		};
	});

	const sendComment = async () => {
		if (content && comment && comment.length > 0) {
			await api.POST(
				`/comments/`,
				{ chart: content.id, content: comment, language: locale.get() },
				access_token,
				user
			);
			comment = "";
			getComments(page);
		}
	};

	const getComments = async (page?: number) => {
		if (content) {
			commentStatus = Status.RETRIEVING;
			comments = null;
			const resp = await api.GET(
				`/comments/?chart=${content.id}&order=-like_count${
					page ? `&page=${page}` : ""
				}`,
				access_token,
				user
			);
			const json = await resp.json();
			comments = json.results;
			commentCount = json.count;
			previousComments = json.previous;
			nextComments = json.next;
			console.log(json);
			commentStatus = Status.OK;
		}
	};

	const submitVote = async () => {
		voteStatus = Status.SENDING;
		const resp = await api.POST(
			"/votes/",
			{
				chart: content?.id,
				arrangement: arrangement,
				feel: feel,
				visual_effects: vfx,
				innovativeness: innovativeness,
				concord: concord,
				impression: impression,
			},
			access_token,
			user
		);
		if (resp.ok) {
			window.location.reload();
		} else {
			const json = await resp.json();
			voteMsg = json.detail;
			voteStatus = Status.ERROR;
			console.log(json);
		}
	};

	if (status === Status.OK) {
		Chart.register(...registerables);
	}
</script>

<svelte:head>
	<title
		>{$t("chart.chart")} - {typeof content?.song == "object"
			? content?.song.name
			: ""}
		{content ? `[${content.level}${Math.floor(content.difficulty)}]` : ""} | {$t(
			"common.title"
		)}</title
	>
</svelte:head>

{#if status === Status.OK && content !== null && typeof content.song === "object"}
	{#if access_token}
		<input type="checkbox" id="chart-vote" class="modal-toggle" />
		<div class="modal">
			<div class="modal-box bg-base-100 min-w-fit w-[50vw] max-w-[1200px]">
				<label
					for="chart-vote"
					class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
					>✕</label
				>
				<h2 class="font-bold text-xl mb-4">{$t("common.vote")}</h2>
				<div
					class="form-control"
					on:focusin={() => {
						voteStatus = Status.OK;
					}}
				>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.arrangement")}</span
						>
						<div class="w-[70%]">
							<input
								type="range"
								min="0"
								max="5"
								bind:value={arrangement}
								class="range"
								step="1"
							/>
							<!-- <div class="w-full flex justify-between text-xs px-2">
							<span>|</span>
							<span>|</span>
							<span>|</span>
							<span>|</span>
							<span>|</span>
							<span>|</span>
						</div> -->
						</div>
						<p class="text-xl font-bold w-[5%] text-center">{arrangement}</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.feel")}</span
						>
						<div class="w-[70%]">
							<input
								type="range"
								min="0"
								max="5"
								bind:value={feel}
								class="range"
								step="1"
							/>
						</div>
						<p class="text-xl font-bold w-[5%] text-center">{feel}</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.vfx")}</span
						>
						<div class="w-[70%]">
							<input
								type="range"
								min="0"
								max="5"
								bind:value={vfx}
								class="range"
								step="1"
							/>
						</div>
						<p class="text-xl font-bold w-[5%] text-center">{vfx}</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.innovativeness")}</span
						>
						<div class="w-[70%]">
							<input
								type="range"
								min="0"
								max="5"
								bind:value={innovativeness}
								class="range"
								step="1"
							/>
						</div>
						<p class="text-xl font-bold w-[5%] text-center">{innovativeness}</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.concord")}</span
						>
						<div class="w-[70%]">
							<input
								type="range"
								min="0"
								max="5"
								bind:value={concord}
								class="range"
								step="1"
							/>
						</div>
						<p class="text-xl font-bold w-[5%] text-center">{concord}</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.impression")}</span
						>
						<div class="w-[70%]">
							<input
								type="range"
								min="0"
								max="5"
								bind:value={impression}
								class="range"
								step="1"
							/>
						</div>
						<p class="text-xl font-bold w-[5%] text-center">{impression}</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.multiplier")}</span
						>
						<p class="text-xl font-bold w-3/4">
							{getMultiplier(getUserLevel(user.exp)).toFixed(1)}
						</p>
					</div>
					<div class="flex gap-3">
						<span
							class="badge badge-lg badge-secondary text-lg mr-1 w-1/4 min-w-fit"
							>{$t("chart.score")}</span
						>
						<p class="text-xl font-bold w-3/4">
							{(
								(arrangement +
									feel +
									vfx +
									innovativeness +
									concord +
									impression) *
								getMultiplier(getUserLevel(user.exp))
							).toFixed(2)}
						</p>
					</div>
				</div>
				<div class="modal-action">
					{#if voteStatus === Status.ERROR}
						<div
							class="tooltip tooltip-open tooltip-left tooltip-error"
							data-tip={voteMsg}
						>
							<button class="btn btn-error">{$t("common.error")}</button>
						</div>
					{:else if voteStatus === Status.SENDING}
						<button class={`btn btn-outline btn-ghost btn-disabled`}
							>{$t("common.waiting")}</button
						>
					{:else}
						<button class="btn btn-primary btn-outline" on:click={submitVote}
							>{$t("common.submit")}</button
						>
					{/if}
				</div>
			</div>
		</div>
	{/if}
	<div class="bg-base-200 page py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[540px] max-w-7xl main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("chart.chart")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex font-bold items-center">
							{content.song.name}
							<div class="ml-2 min-w-fit flex gap-1 align-middle">
								<div class="btn-group btn-group-horizontal">
									<button
										class="btn btn-secondary btn-sm text-2xl no-animation"
									>
										{content.level}
										{Math.floor(content.difficulty)}
									</button>
									{#if content.ranked}
										<button class="btn btn-sm text-2xl no-animation">
											{$t("chart.ranked")}
										</button>
									{/if}
								</div>
							</div>
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
									{content.difficulty.toFixed(1)}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.charter")}</span
									>
									{#if content.charter}
										{#each parseRichText(content.charter) as t}
											{#if t.id > 0}
												<a
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
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.notes")}</span
									>
									{content.notes}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.score")}</span
									>
									{content.score.toFixed(2)}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.rating")}</span
									>
									{content.rating.toFixed(2)}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.equivalent_vote_count")}</span
									>
									{content.rating > 0
										? (content.score / content.rating).toFixed(2)
										: 0}
								</p>
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.real_vote_count")}</span
									>
									{content.votes}
								</p>
								{#if content.description}
									<p class="content">
										<span class="badge badge-primary badge-outline mr-1"
											>{$t("common.description")}</span
										>
										{content.description}
									</p>
								{/if}
							</div>
							<div class="divider divider-horizontal" />
							<div class="w-1/2 float-right p-4 form-control gap-3">
								<canvas bind:this={radarChartElement} />
								<div class="flex justify-center gap-2">
									<Like
										id={content.like}
										likes={content.like_count}
										type="chart"
										target={content.id}
										token={access_token}
										{user}
										css="md"
									/>
									<label
										for="chart-vote"
										class={`btn ${
											access_token ? "btn-primary" : "btn-disabled"
										} btn-outline flex gap-1`}
									>
										<svg
											fill="currentColor"
											width="16px"
											height="26px"
											viewBox="0 0 18 32"
											version="1.1"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M13.52 5.72h-7.4c-0.36 0-0.56 0.2-0.6 0.24l-5.28 5.28c-0.040 0.040-0.24 0.24-0.24 0.56v12.2c0 1.24 1 2.24 2.24 2.24h11.24c1.24 0 2.24-1 2.24-2.24v-16.040c0.040-1.24-0.96-2.24-2.2-2.24zM5.28 8.56v1.8c0 0.32-0.24 0.56-0.56 0.56h-1.84l2.4-2.36zM14.080 24.040c0 0.32-0.28 0.56-0.56 0.56h-11.28c-0.32 0-0.56-0.28-0.56-0.56v-11.36h3.040c1.24 0 2.24-1 2.24-2.24v-3.040h6.52c0.32 0 0.56 0.24 0.56 0.56l0.040 16.080z"
											/>
										</svg>
										{$t("common.vote")}
									</label>
									{#if content.chart && access_token}
										<a
											href={content.chart}
											target="_blank"
											rel="noreferrer"
											download
										>
											<button class="btn btn-primary btn-outline flex gap-1">
												<svg
													fill="currentColor"
													width="14px"
													height="28px"
													viewBox="0 0 16 32"
													version="1.1"
													xmlns="http://www.w3.org/2000/svg"
												>
													<path
														d="M13.48 17.6c-0.48 0-0.84 0.36-0.84 0.84v3.92c0 0.48-0.36 0.84-0.84 0.84h-9.28c-0.48 0-0.84-0.36-0.84-0.84v-3.92c0-0.44-0.36-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v3.92c0 1.4 1.12 2.52 2.52 2.52h9.28c1.4 0 2.52-1.12 2.52-2.52v-3.92c0-0.44-0.36-0.84-0.84-0.84zM6.56 18.48c0.040 0.040 0.2 0.28 0.6 0.28s0.56-0.24 0.6-0.28l3.52-3.52c0.32-0.32 0.32-0.84 0-1.2-0.32-0.32-0.84-0.32-1.2 0l-2.080 2.12v-7.92c0-0.48-0.36-0.84-0.84-0.84s-0.84 0.36-0.84 0.84v7.92l-2.080-2.080c-0.32-0.32-0.84-0.32-1.2 0-0.32 0.32-0.32 0.84 0 1.2l3.52 3.48z"
													/>
												</svg>
												{$t("common.download")}
											</button>
										</a>
									{/if}
								</div>
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
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="flex items-center">
							<textarea
								class={`mr-3 textarea ${
									access_token
										? "textarea-primary"
										: "textarea-disabled pointer-events-none"
								} w-11/12`}
								placeholder={$t("common.write_comment")}
								bind:value={comment}
							/>
							<button
								class={`ml-3 btn ${
									comment.length > 0 && access_token
										? "btn-outline btn-primary"
										: "btn-ghost btn-disabled"
								} w-1/12 min-w-fit`}
								on:click={() => {
									sendComment();
								}}>{$t("common.send")}</button
							>
						</div>
						{#if commentStatus === Status.OK && comments}
							{#each comments as comment}
								<Comment {comment} token={access_token} {user} />
							{/each}
						{/if}
						<Pagination
							bind:previous={previousComments}
							bind:next={nextComments}
							bind:results={comments}
							bind:count={commentCount}
							bind:page
							bind:status
							token={access_token}
							{user}
						/>
					</div>
				</div>
			</div>
		</div>
		<div class="mx-4 w-80 form-control">
			{#if content.owner && typeof content.owner === "object"}
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("chart.owner")}</span
					>
					<User user={content.owner} operator={user} token={access_token} />
				</div>
			{/if}
			<div class="indicator my-4 w-full">
				<span
					class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("song.song")}</span
				>
				<Song song={content.song} token={access_token} {user} />
			</div>
			{#if content.records && content.records.length > 0}
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("common.records")}</span
					>
					<div class="card w-80 bg-base-100 shadow-lg overflow-hidden">
						<div class="card-body gap-2 items-center justify-center">
							{#each content.records as record, i}
								<Record
									{record}
									chart={content}
									pos={content.ranked ? i + 1 : undefined}
									showChart={false}
								/>
							{/each}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}

	.main-width {
		width: calc(100% - 80px);
	}
</style>
