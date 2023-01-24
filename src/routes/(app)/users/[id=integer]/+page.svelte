<script lang="ts">
	import { Status } from "$lib/constants";
	import * as api from "$lib/api";
	import { t } from "$lib/translations/config";
	import {
		getUserLevel,
		parseDateTime,
		parseMonthAndDay,
		parseRichText,
	} from "$lib/utils";
	import { onMount } from "svelte";
	import Like from "$lib/components/like.svelte";
	import Record from "$lib/components/record.svelte";
	import Comment from "$lib/components/comment.svelte";
	export let data: import("./$types").PageData;
	$: ({
		status,
		content,
		error,
		charts,
		songs,
		recentRecords,
		bestRecords,
		comments,
		access_token,
		user,
	} = data);

	let fans: number,
		isFollowing: boolean | null,
		followError = "";

	onMount(() => {
		if (status === Status.OK && content) {
			fans = content.fans;
			isFollowing = content.is_following;
		}
	});

	const follow = async () => {
		if (!content) return;
		isFollowing = true;
		fans++;
		const resp = await api.POST(
			"/relations/",
			{
				followee: content.id,
				operation: 0,
			},
			access_token,
			user
		);
		if (!resp.ok) {
			const json = await resp.json();
			followError = json.detail;
			console.log(json);
			isFollowing = false;
			fans--;
			setTimeout(() => {
				followError = "";
			}, 3500);
		}
	};

	const unfollow = async () => {
		if (!content) return;
		isFollowing = false;
		fans--;
		const resp = await api.POST(
			"/relations/",
			{
				followee: content.id,
				operation: 1,
			},
			access_token,
			user
		);
		if (!resp.ok) {
			const json = await resp.json();
			followError = json.detail;
			console.log(json);
			isFollowing = true;
			fans++;
			setTimeout(() => {
				followError = "";
			}, 3500);
		}
	};
</script>

<svelte:head>
	<title>{$t("user.user")} - {content?.username} | {$t("common.title")}</title>
</svelte:head>

<div class="bg-base-200 page py-24 px-12 justify-center flex">
	<div class="mx-4 w-full max-w-[1800px]">
		{#if status === Status.OK && content}
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("user.user")}</span
				>
				<div
					class="card card-side min-w-fit w-full bg-base-100 border border-base-300 shadow-lg"
				>
					<figure
						class="min-w-[150px] max-w-[28%] px-6 py-6 form-control border-r border-base-300 mx-auto overflow-visible"
					>
						<div class="avatar min-w-fit h-fit">
							<div
								class={`mx-auto w-[140px] h-[140px] rounded-full m-2 border-[4px] ${
									content.type == "admin"
										? "border-indigo-500"
										: content.type == "volunteer"
										? "border-emerald-500"
										: content.type == "qualified"
										? "border-sky-500"
										: "border-neutral-500"
								}`}
							>
								<img src={content.avatar} alt="Avatar" />
							</div>
						</div>
						<p class="text-3xl text-center font-bold h-fit">
							{content.username}
						</p>
						<div class="flex items-center justify-center gap-1 h-fit">
							<span class="badge badge-sm font-bold"
								>LV{getUserLevel(content.exp)}</span
							>
							{#if content.gender == 1}
								<span class="badge badge-sm">
									<svg
										fill="currentColor"
										width="20px"
										height="20px"
										viewBox="-7 0 32 32"
										version="1.1"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M17.56 8.060c0-0.44-0.36-0.88-0.84-0.88h-4.6c-0.48 0-0.84 0.36-0.84 0.84s0.36 0.84 0.84 0.84h2.6l-3.6 3.6c-1.16-0.92-2.64-1.48-4.24-1.48-3.76 0.080-6.88 3.16-6.88 6.96s3.12 6.88 6.88 6.88 6.88-3.080 6.88-6.88c0-1.6-0.56-3.040-1.48-4.24l3.6-3.6v2.76c0 0.48 0.36 0.84 0.84 0.84s0.84-0.36 0.84-0.84c0 0 0-4.8 0-4.8zM6.88 23.14c-2.88 0-5.2-2.32-5.2-5.2s2.32-5.2 5.2-5.2 5.2 2.32 5.2 5.2-2.32 5.2-5.2 5.2z"
										/>
									</svg>
								</span>
							{:else if content.gender == 2}
								<span class="badge badge-sm">
									<svg
										fill="currentColor"
										width="20px"
										height="20px"
										viewBox="-9 0 32 32"
										version="1.1"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M13.76 12.040c0-3.8-3.080-6.88-6.88-6.88s-6.88 3.12-6.88 6.88c0 3.52 2.64 6.4 6.040 6.84v3.56h-2c-0.48 0-0.84 0.36-0.84 0.84s0.36 0.84 0.84 0.84h2v1.88c0 0.48 0.36 0.84 0.84 0.84s0.84-0.36 0.84-0.84v-1.88h2c0.48 0 0.84-0.36 0.84-0.84s-0.36-0.84-0.84-0.84h-2v-3.56c3.4-0.44 6.040-3.32 6.040-6.84zM1.68 12.040c0-2.88 2.32-5.2 5.2-5.2s5.2 2.32 5.2 5.2-2.32 5.2-5.2 5.2-5.2-2.32-5.2-5.2z"
										/>
									</svg>
								</span>
							{/if}
							{#if content.tag}
								<span class="badge badge-sm badge-accent">{content.tag}</span>
							{/if}
						</div>
						<div class="mt-4 w-full form-control gap-0.5 h-fit">
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("user.id")}</span
								>
								{content.id}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("user.type")}</span
								>
								{$t(`user.types.${content.type}`)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("user.rks")}</span
								>
								{content.rks.toFixed(3)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("user.exp")}</span
								>
								{content.exp}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("user.language")}</span
								>
								{$t(`common.lang.${content.language}`)}
							</p>
							<a
								data-sveltekit-preload-data
								href={`/users/${content.id}/following`}
							>
								<span
									class="badge badge-primary badge-outline mr-1 hover:underline"
									>{$t("user.following")}</span
								>
								{content.following}
							</a>
							<a data-sveltekit-preload-data href={`/users/${content.id}/fans`}>
								<span
									class="badge badge-primary badge-outline mr-1 hover:underline"
									>{$t("user.fans")}</span
								>
								{fans}
							</a>
							{#if content.date_of_birth}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("user.date_of_birth")}</span
									>
									{parseMonthAndDay(content.date_of_birth)}
								</p>
							{/if}
							{#if content.last_login}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("user.last_login")}</span
									>
									{parseDateTime(content.last_login)}
								</p>
							{/if}
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("user.date_joined")}</span
								>
								{parseDateTime(content.date_joined)}
							</p>
							{#if content.bio}
								<p class="content">
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("user.bio")}</span
									>
									{content.bio}
								</p>
							{/if}
						</div>
						<div>
							<div
								class={followError
									? "tooltip tooltip-open tooltip-error tooltip-bottom flex justify-center my-3 h-fit"
									: "flex justify-center my-3 h-fit"}
								data-tip={followError}
							>
								{#if !isFollowing}
									<button
										class="w-fit btn btn-outline btn-primary text-sm"
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
					</figure>
					<div class="card-body pt-3 max-w-full">
						{#if charts}
							<div class="flex items-center mt-6 mb-2">
								<h2 class="text-3xl font-bold w-full">
									{$t("user.charts")}
								</h2>
								{#if charts.length > 0}
									<a class="min-w-fit" href={`/charts?owner=${content.id}`}>
										<button class="btn btn-sm btn-primary btn-outline">
											{$t("common.all")}
										</button>
									</a>
								{/if}
							</div>
							{#if charts.length > 0}
								<ul class="menu bg-base-100 w-full border border-base-300">
									{#each charts as chart}
										<li>
											<a
												href={`/charts/${chart.id}`}
												class="w-full overflow-hidden h-[82px] flex px-5"
											>
												<div class="w-5/12">
													<div
														class="text-xl font-bold whitespace-no-wrap text-ellipsis"
													>
														{chart.song.name}
													</div>
												</div>
												<div class="w-1/12 min-w-fit">
													<div
														class="mr-1 badge badge-lg text-lg badge-secondary"
													>
														{chart.level}
														{Math.floor(chart.difficulty)}
													</div>
												</div>
												<div
													class="w-5/12 text-lg whitespace-no-wrap text-ellipsis"
												>
													{#each parseRichText(chart.charter) as t}
														{#if t.id > 0}
															<a
																href={`/users/${t.id}`}
																class="text-accent hover:underline">{t.text}</a
															>
														{:else}
															{t.text}
														{/if}
													{/each}
												</div>
												<div
													class="w-1/12 min-w-fit"
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
														token={access_token}
														{user}
														css="sm"
													/>
												</div>
											</a>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="py-3 text-center">{$t("common.empty")}</p>
							{/if}
						{/if}
						{#if songs}
							<div class="flex items-center mt-6 mb-2">
								<h2 class="text-3xl font-bold w-full">
									{$t("user.songs")}
								</h2>
								{#if songs.length > 0}
									<a class="min-w-fit" href={`/songs?owner=${content.id}`}>
										<button class="btn btn-sm btn-primary btn-outline">
											{$t("common.all")}
										</button>
									</a>
								{/if}
							</div>
							{#if songs.length > 0}
								<ul class="menu bg-base-100 w-full border border-base-300">
									{#each songs as song}
										<li>
											<a
												href={`/songs/${song.id}`}
												class="w-full overflow-hidden h-[82px] flex px-5"
											>
												<div class="w-1/2">
													<div class="text-xl font-bold">
														{song.name}
														{#if song.original}
															<div class="ml-1 badge badge-lg badge-secondary">
																{$t("song.original")}
															</div>
														{/if}
													</div>
												</div>
												<div class="w-5/12">
													<div class="text-lg">
														{song.composer}
													</div>
												</div>
												<div
													class="w-1/12 min-w-fit"
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
														token={access_token}
														{user}
														css="sm"
													/>
												</div>
											</a>
										</li>
									{/each}
								</ul>
							{:else}
								<p class="py-3 text-center">{$t("common.empty")}</p>
							{/if}
						{/if}
						{#if recentRecords}
							<div class="flex items-center mt-6 mb-2">
								<h2 class="text-3xl font-bold w-full">
									{$t("user.recent_records")}
								</h2>
								{#if recentRecords.length > 0}
									<a class="min-w-fit" href={`/records?player=${content.id}`}>
										<button class="btn btn-sm btn-primary btn-outline">
											{$t("common.all")}
										</button>
									</a>
								{/if}
							</div>
							{#if recentRecords.length > 0}
								<div class="grid-result">
									{#each recentRecords as record}
										<Record {record} />
									{/each}
								</div>
							{:else}
								<p class="py-3 text-center">{$t("common.empty")}</p>
							{/if}
						{/if}
						{#if bestRecords}
							<div class="flex items-center mt-6 mb-2">
								<h2 class="text-3xl font-bold w-full">
									{$t("user.best_records")}
								</h2>
								{#if bestRecords.length > 0}
									<a
										class="min-w-fit"
										href={`/records?player=${content.id}&order=-rks`}
									>
										<button class="btn btn-sm btn-primary btn-outline">
											{$t("common.all")}
										</button>
									</a>
								{/if}
							</div>
							{#if bestRecords.length > 0}
								<div class="grid-result">
									{#each bestRecords as record}
										<Record {record} />
									{/each}
								</div>
							{:else}
								<p class="py-3 text-center">{$t("common.empty")}</p>
							{/if}
						{/if}
						{#if comments}
							<h2 class="text-3xl font-bold mt-6 mb-2">
								{$t("user.comments")}
							</h2>
							{#if comments.length > 0}
								<div class="form-control gap-1">
									{#each comments as comment}
										<Comment
											{comment}
											token={access_token}
											{user}
											showUser={false}
											showSource
										/>
									{/each}
								</div>
							{:else}
								<p class="py-3 text-center">{$t("common.empty")}</p>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
	.grid-result {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		grid-gap: 1rem;
	}
</style>
