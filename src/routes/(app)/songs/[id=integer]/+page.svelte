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
	import { onDestroy, onMount } from "svelte";
	import type { Chart, Comment } from "$lib/models";
	import CommentCard from "$lib/components/comment.svelte";
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
	} = data);

	let playerState = {
		isPlaying: false,
		currentTime: 0,
		volume: 1,
	};

	let audio: HTMLAudioElement,
		duration = 0,
		lyrics: { time: number; line: any }[],
		line = "",
		lyricsIndex = -1,
		loop = false,
		followed = false,
		fans = 0,
		charts: Chart[],
		comment = "",
		page = 1,
		isCommentLoaded = true;

	onMount(() => {
		if (status === Status.OK && content) {
			audio = new Audio(content.song);
			duration = parseDuration(content.duration);
			lyrics = parseLyrics(content.lyrics);
			console.log("audio ready with duration", duration, "and lyrics", lyrics);
			followed = userRelation ? userRelation.count !== 0 : false;
			fans = typeof content.owner === "object" ? content.owner.fans : 0;
			console.log(comments);
		}
	});

	const syncLyrics = () => {
		if (playerState.currentTime < lyrics[0].time) {
			return;
		}
		let l = 0,
			r = lyrics.length - 1,
			m = (l + r) >> 1;
		while (l < r) {
			console.log(
				l,
				r,
				m,
				lyrics[m].time,
				playerState.currentTime,
				lyrics[m + 1].time
			);
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
		console.log("lyrics synced", lyrics[m]);
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
				token
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
				token
			);
			if (!resp.ok) {
				console.log(await resp.json());
			}
		}
	};

	const getCharts = async () => {
		if (charts) {
			return;
		}
		const resp = await api.GET(
			`charts/?song=${content?.id}&order=owner&pagination=0`,
			token
		);
		if (resp.ok) {
			charts = await resp.json();
			console.log(charts);
		}
	};

	const sendComment = async () => {
		if (content && comment && comment.length > 0) {
			await api.POST(
				`comments/`,
				{ song: content.id, content: comment, language: locale.get() },
				token
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
				token
			);
			const json = await resp.json();
			comments = json.results;
			previousComments = json.previous;
			nextComments = json.next;
			console.log(json);
			isCommentLoaded = true;
		}
	};
</script>

{#if status === Status.OK && content !== null}
	<div class="bg-base-200 py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[540px] main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("song.song")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-2xl bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex items-center">
							{content.name}
							{#if content.original}
								<div class="ml-3 badge badge-secondary">
									{$t("song.original")}
								</div>
							{/if}
						</div>
						<div class="flex">
							<div class="w-1/3">
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
										>{$t("song.duration")}</span
									>
									{convertDuration(content.duration)}
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
							<div class="w-2/3 float-right">
								<div class="bg-white rounded-lg shadow-lg overflow-hidden">
									<div class="relative">
										<img
											src={content.illustration}
											class="object-cover"
											alt="illustration"
										/>
										{#if line}
											<div
												class="absolute p-4 inset-0 flex flex-col justify-end backdrop backdrop-blur-5 text-white"
											>
												<span
													class="text-white px-2 py-0.5 w-fit bg-black bg-opacity-60 rounded-full"
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
													{convertDuration(playerState.currentTime)}
												</p>
											</div>
											<div>
												<div class="flex items-center space-x-3 p-2">
													<button
														class={`btn btn-circle btn-sm btn-secondary ${
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
														class="btn btn-circle btn-sm btn-secondary btn-outline glass flex items-center justify-center"
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
															class="btn btn-circle btn-accent btn-outline glass flex items-center justify-center px-0.5"
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
															class="btn btn-circle btn-accent btn-outline glass flex items-center justify-center px-0.5"
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
														class="btn btn-circle btn-sm btn-secondary btn-outline glass flex items-center justify-center"
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
															class="btn btn-circle btn-sm rounded-full btn-secondary btn-outline glass flex items-center justify-center"
															title={$t("song.volume")}
															for=""
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
						<div
							tabindex="-1"
							class="collapse collapse-arrow border border-base-300 shadow-lg bg-base-100 mt-4 rounded-box"
							on:pointerenter={getCharts}
						>
							<div class="collapse-title text-xl font-medium">
								{$t("song.charts")}
							</div>
							<div class="collapse-content">
								{#if charts}
									<ul class="menu bg-base-100 w-full border border-base-300">
										{#each charts as chart}
											<li>
												<a
													href={`/charts/${chart.id}`}
													class="w-full flex px-5"
												>
													<div class="w-1/6 min-w-fit">
														<div class="mr-1 badge badge-lg badge-primary">
															{chart.level}
															{chart.difficulty.toString().split(".")[0]}
														</div>
													</div>
													<div class="w-2/3 text-lg">
														{#each parseCharter(chart.charter) as t}
															{#if t.id > 0}
																<a
																	href={`/users/${t.id}`}
																	class="text-accent hover:underline"
																	>{t.text}</a
																>
															{:else}
																{t.text}
															{/if}
														{/each}
													</div>
													<div class="w-1/6 min-w-fit">
														<div
															class="radial-progress text-secondary"
															style={`--value:${
																chart.rating * 4
															}; --size:48px;`}
														>
															{chart.rating}
														</div>
													</div>
												</a>
											</li>
										{/each}
									</ul>
								{/if}
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
									<CommentCard {comment} {token} />
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
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t(content.original ? "song.author" : "song.uploader")}</span
					>
					<div class="card flex-shrink-0 w-full shadow-2xl bg-base-100">
						<div class="card-body py-3 px-4 items-center">
							<div class="avatar items-center min-w-fit">
								<div class="w-10 rounded-full">
									<img src={content.owner.avatar} alt="Avatar" />
								</div>
								<p class="ml-2">{content.owner.username}</p>
							</div>
							{#if !followed}
								<button
									class="w-fit btn btn-outline btn-secondary glass text-sm"
									on:click={follow}>{$t("user.follow")} {fans}</button
								>
							{:else}
								<button
									class="w-fit btn btn-outline btn-ghost text-sm"
									on:click={unfollow}>{$t("user.unfollow")} {fans}</button
								>
							{/if}
						</div>
					</div>
				</div>
			{/if}
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
