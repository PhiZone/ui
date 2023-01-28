<script lang="ts">
	import { Status } from "$lib/constants";
	import { locale, t } from "$lib/translations/config";
	import {
		convertDuration,
		parseRichText,
		parseDuration,
		parseLyrics,
		parseDateTime,
	} from "$lib/utils";
	import * as api from "$lib/api";
	import { onDestroy, onMount } from "svelte";
	import type { Chart } from "$lib/models";
	import Comment from "$lib/components/comment.svelte";
	import User from "$lib/components/user.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import Like from "$lib/components/like.svelte";
	import Chapter from "$lib/components/chapter.svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, commentRes, access_token, user } = data);

	let playerState = {
		isPlaying: false,
		currentTime: 0,
	};

	let audio: HTMLAudioElement,
		duration = 0,
		lyrics: { time: number; line: any }[],
		line = "",
		lyricsIndex = -1,
		loop = false,
		showCharts = false,
		charts: Chart[],
		comment = "",
		pageCount = 1,
		comments: any[] | null,
		commentCount: number,
		previousComments: string,
		nextComments: string,
		commentStatus = Status.RETRIEVING;

	onMount(() => {
		commentStatus = status;
		if (status === Status.OK && content) {
			audio = new Audio(content.song);
			audio.volume = 0.4;
			duration = parseDuration(content.duration);
			if (content.lyrics) {
				lyrics = parseLyrics(content.lyrics);
			}
			// console.log("audio ready with duration", duration, "and lyrics", lyrics);
		}
		if (commentRes) {
			comments = commentRes.results;
			commentCount = commentRes.count;
			previousComments = commentRes.previous;
			nextComments = commentRes.next;
		}
	});

	const syncLyrics = () => {
		if (!lyrics || playerState.currentTime < lyrics[0].time) {
			return;
		}
		let l = 0,
			r = lyrics.length - 1,
			m = (l + r) >> 1;
		while (l < r) {
			// console.log(
			// 	l,
			// 	r,
			// 	m,
			// 	lyrics[m].time,
			// 	playerState.currentTime,
			// 	lyrics[m + 1].time
			// );
			if (
				lyrics[m].time <= playerState.currentTime &&
				lyrics[m + 1].time > playerState.currentTime
			) {
				break;
			} else if (lyrics[m].time > playerState.currentTime) {
				r = m - 1;
			} else if (lyrics[m + 1].time <= playerState.currentTime) {
				l = m + 1;
			}
			m = (l + r) >> 1;
		}
		lyricsIndex = m;
		line = lyrics[lyricsIndex].line;
		// console.log("lyrics synced", lyrics[m]);
	};

	let timer: NodeJS.Timeout;

	const playAudio = () => {
		audio.currentTime = playerState.currentTime;
		syncLyrics();
		audio.play();
		playerState.isPlaying = true;
		timer = setInterval(() => {
			playerState.currentTime = audio ? audio.currentTime : 0;
			if (
				lyrics &&
				lyricsIndex < lyrics.length - 1 &&
				lyrics[lyricsIndex + 1].time < playerState.currentTime
			) {
				line = lyrics[++lyricsIndex].line;
			}
			if (audio.ended) {
				if (loop) {
					audio.currentTime = playerState.currentTime = 0;
					syncLyrics();
					audio.play();
					playerState.isPlaying = true;
				} else {
					playerState.isPlaying = false;
					clearInterval(timer);
				}
			}
		}, 50);
	};

	const pauseAudio = () => {
		audio.pause();
		playerState.isPlaying = false;
		clearInterval(timer);
	};

	onDestroy(() => {
		if (playerState.isPlaying) {
			pauseAudio();
		}
	});

	const getCharts = async () => {
		if (charts) {
			return;
		}
		const resp = await api.GET(
			`/charts/?song=${content?.id}&order=owner&pagination=0`,
			access_token,
			user
		);
		if (resp.ok) {
			charts = await resp.json();
		} else {
			console.log(await resp.json());
		}
	};

	const sendComment = async () => {
		if (content && comment && comment.length > 0) {
			await api.POST(
				`/comments/`,
				{ song: content.id, content: comment, language: locale.get() },
				access_token,
				user
			);
			comment = "";
			getComments(pageCount);
		}
	};

	const getComments = async (page?: number) => {
		if (content) {
			commentStatus = Status.RETRIEVING;
			comments = null;
			const resp = await api.GET(
				`/comments/?song=${content.id}&query_user=1&order=-like_count${
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
			commentStatus = Status.OK;
		}
	};
</script>

<svelte:head>
	<title>{$t("song.song")} - {content?.name} | {$t("common.title")}</title>
</svelte:head>

{#if status === Status.OK && content !== null}
	<div class="bg-base-200 page py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[540px] max-w-7xl main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("song.song")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex font-bold items-center">
							{content.name}
							{#if content.original}
								<button
									class="ml-2 btn btn-secondary btn-sm text-xl no-animation"
								>
									{$t("song.original")}
								</button>
							{/if}
						</div>
						<div class="flex">
							<div class="w-1/3">
								<div class="info">
									<div class="form-control gap-1">
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.id")}</span
											>
											{content.id}
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.edition")}</span
											>
											{content.edition}
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.composer")}</span
											>
											{content.composer}
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.illustrator")}</span
											>
											{content.illustrator}
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.bpm")}</span
											>
											{content.bpm}
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.offset")}</span
											>
											{content.offset}ms
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.duration")}</span
											>
											{convertDuration(content.duration)}
										</p>
										<p>
											<span class="badge badge-primary badge-outline mr-1"
												>{$t("song.time")}</span
											>
											{parseDateTime(content.time)}
										</p>
										{#if content.description && content.description.length < 172}
											<p class="content">
												<span class="badge badge-primary badge-outline mr-1"
													>{$t("common.description")}</span
												>
												{content.description}
											</p>
										{/if}
									</div>
								</div>
								<div class="flex gap-2 items-end w-full justify-start">
									<Like
										id={content.like}
										likes={content.like_count}
										type="song"
										target={content.id}
										token={access_token}
										{user}
										css={`md ${access_token ? "w-2/5" : "w-5/6"}`}
									/>
									{#if access_token}
										<a
											href={content.song}
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
							<div class="w-2/3 float-right">
								<div class="bg-white rounded-lg shadow-lg overflow-hidden">
									<div class="relative">
										<img
											src={content.illustration}
											class="object-fill"
											alt="illustration"
										/>
										{#if line}
											<div
												class="absolute p-4 inset-0 flex form-control justify-end backdrop backdrop-blur-5 text-neutral-content"
											>
												<span
													class="text-neutral-content px-2 py-0.5 w-fit bg-black bg-opacity-60 rounded-full"
													>{line}</span
												>
											</div>
										{/if}
									</div>
									{#if audio}
										<div>
											<div class="relative h-3 bg-base-100">
												<input
													type="range"
													min="0"
													max={duration}
													bind:value={playerState.currentTime}
													step={0.001}
													class="range range-primary range-xs"
													on:mousedown={() => {
														pauseAudio();
													}}
													on:mouseup={() => {
														playAudio();
													}}
												/>
											</div>
										</div>
										<div
											class="flex justify-between text-xs font-semibold text-gray-500 px-4 py-2 bg-base-100"
										>
											<div class="w-9">
												<p class="text-left">
													{convertDuration(
														Math.min(
															playerState.currentTime,
															parseDuration(content.duration)
														)
													)}
												</p>
											</div>
											<div>
												<div class="flex items-center space-x-3 p-2">
													<button
														class={`btn btn-circle btn-sm btn-primary ${
															loop ? "btn-active" : "btn-outline glass"
														} flex items-center justify-center`}
														title={$t("song.loop")}
														on:click={() => {
															loop = !loop;
														}}
													>
														<svg
															xmlns="http://www.w3.org/2000/svg"
															xmlns:xlink="http://www.w3.org/1999/xlink"
															version="1.1"
															class="w-[19px] h-[19px]"
															fill="currentColor"
															x="0px"
															y="0px"
															viewBox="0 0 512 512"
															enable-background="new 0 0 512 512"
															xml:space="preserve"
														>
															<path
																d="M447.1,86.2C400.3,33.4,332.2,0,256,0C114.6,0,0,114.6,0,256h64c0-106.1,85.9-192,192-192c58.5,0,110.4,26.5,145.5,67.8  L341.3,192H512V21.3L447.1,86.2z M256,448c-58.5,0-110.4-26.5-145.5-67.8l60.2-60.2H0v170.7l64.9-64.9  c46.8,52.8,115,86.2,191.1,86.2c141.4,0,256-114.6,256-256h-64C448,362.1,362.1,448,256,448z M298.7,256c0-23.6-19.1-42.7-42.7-42.7  s-42.7,19.1-42.7,42.7s19.1,42.7,42.7,42.7S298.7,279.6,298.7,256z"
															/>
														</svg>
													</button>
													<button
														class="btn btn-circle btn-sm btn-primary btn-outline glass flex items-center justify-center"
														title={$t("song.rewind")}
														on:click={() => {
															let time = audio.currentTime - 10;
															audio.currentTime = Math.max(time, 0);
															playerState.currentTime = audio.currentTime;
															syncLyrics();
														}}
													>
														<svg
															class="w-[21px] h-[21px]"
															viewBox="0 0 24 24"
															fill="currentColor"
															><polygon
																points="20 20 10 12 20 4 20 20"
															/><polygon points="10 20 0 12 10 4 10 20" /></svg
														>
													</button>
													{#if playerState.isPlaying}
														<button
															class="btn btn-circle btn-secondary btn-outline glass flex items-center justify-center px-0.5"
															title={$t("song.pause")}
															on:click={() => {
																pauseAudio();
															}}
														>
															<svg
																class="w-8 h-8"
																viewBox="0 0 24 24"
																fill="currentColor"
																><polygon
																	points="5 3 10 3 10 21 5 21 5 3"
																/><polygon
																	points="14 3 19 3 19 21 14 21 14 3"
																/></svg
															>
														</button>
													{:else}
														<button
															class="btn btn-circle btn-secondary btn-outline glass flex items-center justify-center px-0.5"
															title={$t("song.play")}
															on:click={() => {
																playAudio();
															}}
														>
															<svg
																class="w-8 h-8"
																viewBox="0 0 24 24"
																fill="currentColor"
																><polygon points="5 3 19 12 5 21 5 3" /></svg
															>
														</button>
													{/if}
													<button
														class="btn btn-circle btn-sm btn-primary btn-outline glass flex items-center justify-center"
														title={$t("song.fast_forward")}
														on:click={() => {
															let time = audio.currentTime + 10;
															audio.currentTime = Math.min(time, duration);
															playerState.currentTime = audio.currentTime;
															syncLyrics();
														}}
													>
														<svg
															class="w-[21px] h-[21px]"
															viewBox="0 0 24 24"
															fill="currentColor"
															><polygon points="4 4 14 12 4 20 4 4" /><polygon
																points="14 4 24 12 14 20 14 4"
															/></svg
														>
													</button>
													<div
														class="dropdown dropdown-hover dropdown-top float-right"
													>
														<button
															tabindex="0"
															class="btn btn-circle btn-sm rounded-full btn-primary btn-outline glass flex items-center justify-center"
															title={$t("song.volume")}
															><svg
																xmlns="http://www.w3.org/2000/svg"
																class="w-[19px] h-[19px]"
																viewBox="0 0 22 18"
																><g
																	fill="none"
																	fill-rule="evenodd"
																	stroke="currentColor"
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	transform="translate(1 1)"
																	><path
																		d="M9 1L4 5H0v6h4l5 4zM17.07.93c3.904 3.905 3.904 10.235 0 14.14M13.54 4.46a5 5 0 010 7.07"
																	/></g
																></svg
															></button
														>
														<div
															tabindex="-1"
															class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-[12vw]"
														>
															<input
																type="range"
																min="0"
																max="1"
																bind:value={audio.volume}
																step="0.001"
																class="range range-xs"
															/>
														</div>
													</div>
												</div>
											</div>
											<div class="w-9">
												<p class="text-right">
													{convertDuration(content.duration)}
												</p>
											</div>
										</div>
									{/if}
								</div>
							</div>
						</div>
						{#if content.description && content.description.length >= 172}
							<p class="mt-2 content">
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.description")}</span
								>
								{content.description}
							</p>
						{/if}
						{#if content.charts}
							<button
								class="mt-4 btn text-base btn-primary glass btn-outline"
								on:pointerenter={getCharts}
								on:click={() => {
									showCharts = !showCharts;
								}}
								>{showCharts ? $t("song.hide_charts") : $t("song.show_charts")} ({content.charts})</button
							>
							<div class="collapse min-h-0">
								<input
									type="checkbox"
									class="hidden"
									bind:checked={showCharts}
								/>
								<div class="collapse-content">
									<ul class="menu bg-base-100 w-full rounded-box">
										{#if charts}
											{#if charts.length > 0}
												<ul class="menu bg-base-100 w-full">
													{#each charts as chart}
														<li class="border border-base-300">
															<a
																
																href={`/charts/${chart.id}`}
																class="w-full h-[82px] flex px-5"
															>
																<div class="w-1/6 min-w-fit">
																	<div
																		class="mr-1 badge badge-lg text-lg badge-secondary"
																	>
																		{chart.level}
																		{Math.floor(chart.difficulty)}
																	</div>
																</div>
																<div class="w-2/3 text-lg">
																	{#if chart.charter}
																		{#each parseRichText(chart.charter) as t}
																			{#if t.id > 0 && chart.collab_status}
																				<a
																					
																					href={`/users/${t.id}`}
																					class="text-accent hover:underline"
																					>{t.text}</a
																				>
																			{:else}
																				{t.text}
																			{/if}
																		{/each}
																	{:else}
																		{$t("common.anonymous")}
																	{/if}
																</div>
																<div
																	class="w-1/6 flex gap-3 items-center justify-end min-w-fit"
																>
																	<div
																		class="radial-progress text-primary"
																		style={`
																--value: ${chart.rating * 3.33333333333333333333};
																--size: 48px;
																`}
																	>
																		{chart.rating.toFixed(1)}
																	</div>
																	<div
																		on:click={(e) => {
																			e.preventDefault();
																		}}
																		on:keyup
																	>
																		<Like
																			id={chart.like}
																			likes={chart.like_count}
																			type="chart"
																			target={chart.id}
																			token={access_token}
																			{user}
																			css="sm"
																		/>
																	</div>
																</div>
															</a>
														</li>
													{/each}
												</ul>
											{:else}
												<p class="pt-3 text-center">{$t("common.empty")}</p>
											{/if}
										{:else}
											<p class="pt-3 text-center">{$t("common.loading")}</p>
										{/if}
									</ul>
								</div>
							</div>
						{/if}
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
						{#if commentStatus === Status.OK}
							{#if comments && comments.length > 0}
								{#each comments as comment}
									<Comment {comment} token={access_token} {user} />
								{/each}
								<Pagination
									previous={previousComments}
									next={nextComments}
									bind:results={comments}
									bind:count={commentCount}
									bind:page={pageCount}
									bind:status={commentStatus}
									token={access_token}
									{user}
								/>
							{:else}
								<p class="py-3 text-center">{$t("common.empty")}</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		</div>
		<div class="mx-4 w-80 form-control">
			{#if typeof content.uploader === "object"}
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t(content.original ? "song.author" : "song.uploader")}</span
					>
					<User user={content.uploader} operator={user} token={access_token} />
				</div>
			{/if}
			{#if typeof content.chapters === "object"}
				{#each content.chapters as chapter}
					<div class="indicator my-4 w-full">
						<span
							class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
							>{$t("song.chapter")}</span
						>
						<Chapter {chapter} token={access_token} {user} />
					</div>
				{/each}
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

	.info {
		height: calc(100% - 48px);
	}
</style>
