<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import {
		getCompressedImage,
		getLevelColor,
		getUserLevel,
		getUserPrivilege,
		parseDateTime,
		parseRichText,
	} from "$lib/utils";
	import { onMount } from "svelte";
	import * as api from "$lib/api";
	import Song from "$lib/components/song.svelte";
	import { goto, preloadData } from "$app/navigation";

	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let score = 0,
		message: string;

	onMount(() => {
		if (error) {
			console.log(error);
		}
	});

	const levelTypes = ["EZ", "HD", "IN", "AT", "SP"];

	const handleSubmit = async () => {
		const resp = await api.POST(
			"/volunteer_votes/",
			{
				chart: content?.id,
				value: score,
				message: message,
			},
			access_token,
			user
		);
		if (resp.ok) {
			window.location.reload();
		} else {
			console.log(await resp.json());
		}
	};
</script>

<svelte:head>
	<title>
		{$t("studio.chart_submission")} - {content?.song
			? content?.song.name
			: content?.song_upload?.name}
		{content ? `[${content.level}${Math.floor(content.difficulty)}]` : ""} | {$t(
			"common.title"
		)}
	</title>
</svelte:head>

{#if status === Status.OK && content !== null}
	<input type="checkbox" id="studio-chart-submission" class="modal-toggle" />
	<div class="modal">
		<div class="modal-box bg-base-100">
			<h3 class="font-bold text-lg">{$t("common.vote_v")}</h3>
			<div class="flex min-w-full items-center">
				<input
					type="range"
					min="-3"
					max="3"
					bind:value={score}
					class="range min-w-auto"
					step="1"
				/>
				<p class="w-8 text-right text-xl font-bold">{score}</p>
			</div>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("studio.submission.message")}</span
				><textarea
					class="textarea textarea-primary w-full h-48"
					placeholder={$t("studio.submission.write_message")}
					bind:value={message}
				/>
			</label>
			<div class="modal-action btn-group btn-group-horizontal">
				<label
					for="studio-chart-submission"
					class="btn btn-primary btn-outline text-lg">{$t("common.back")}</label
				>
				<label
					for="studio-chart-submission"
					class="btn btn-primary btn-outline text-lg"
					on:click={handleSubmit}
					on:keyup>{$t("common.submit")}</label
				>
			</div>
		</div>
	</div>
	<div class="bg-base-200 min-h-screen py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[340px] max-w-7xl main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("studio.chart_submission")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex font-bold gap-4 items-center">
							{#if content.song}
								<a
									class="hover:underline"
									href={`/songs/${content.song.id}`}
									target="_blank"
									rel="noreferrer"
								>
									{content.song.name}
								</a>
							{:else}
								<a
									class="hover:underline"
									href={`/studio/song-submissions/${content.song_upload?.id}`}
									target="_blank"
									rel="noreferrer"
								>
									{content.song_upload?.name}
								</a>
							{/if}
							<button
								class={`btn ${getLevelColor(
									content.level_type
								)} btn-sm text-2xl no-animation`}
								>{content.level}
								{Math.floor(content.difficulty)}
							</button>
						</div>
						<div>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.chart_level")}</span
								>
								[{levelTypes[content.level_type]}] {content.level}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.chart_difficulty_2")}</span
								>
								{content.difficulty.toFixed(1)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.chart")}</span
								>
								<a
									href={content.chart}
									target="_blank"
									rel="noreferrer"
									class="hover:underline"
									download
								>
									{$t("common.download")}
								</a>
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("chart.charter")}</span
								>
								{#each parseRichText(content.charter) as t}
									{#if t.id > 0}
										<a
											href={`/users/${t.id}`}
											class="text-accent hover:underline"
											target="_blank"
											rel="noreferrer">{t.text}</a
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
							{#if getUserPrivilege(user.type) >= 3 && typeof content.uploader == "object"}
								<p class="min-w-fit">
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("studio.submission.uploader")}</span
									>
									{content.uploader.username}
								</p>
							{/if}
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("studio.submission.uploaded_at")}</span
								>
								{parseDateTime(content.time)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("studio.submission.collab_status")}</span
								>
								{$t(`studio.submission.bi_statuses.${content.collab_status}`)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("studio.submission.adm_status")}</span
								>
								{$t(`studio.submission.bi_statuses.${content.adm_status}`)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("studio.submission.volunteer_status")}</span
								>
								{$t(
									`studio.submission.bi_statuses.${content.volunteer_status}`
								)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("studio.submission.overall_status")}</span
								>
								{$t(`studio.submission.statuses.${content.status}`)}
							</p>
							{#if content.description}
								<p class="content">
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("chart.description")}</span
									>
									{content.description}
								</p>
							{/if}
						</div>
						<div class="card-actions flex items-center justify-end gap-2">
							{#if (typeof content.uploader === "object" && content.uploader.id === user.id) || getUserPrivilege(user.type) >= 3}
								<button
									class="btn btn-primary btn-outline glass text-lg w-32"
									on:click={() => {
										goto(`/studio/chart-submissions/${content?.id}/edit`);
									}}
									on:pointerenter={() => {
										preloadData(
											`/studio/chart-submissions/${content?.id}/edit`
										);
									}}
								>
									{$t("common.edit")}
								</button>
							{/if}
							{#if getUserPrivilege(user.type) >= 3}
								<label
									for="studio-chart-submission"
									class="btn btn-primary btn-outline glass text-lg w-32"
									>{$t("common.vote_v")}</label
								>
							{/if}
						</div>
					</div>
				</div>
			</div>
			{#each content.votes as vote}
				<div class="indicator w-full my-4">
					<span
						class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("studio.submission.volunteer_vote")}</span
					>
					<div
						class="card card-side w-full bg-base-100 border border-base-300 shadow-lg"
					>
						<figure class="w-1/6 min-w-fit">
							<div
								class="relative inline-flex items-center justify-center form-control border-r border-base-300 px-3 py-3 mx-auto my-auto"
							>
								<p class="opacity-80">{$t("studio.submission.score")}</p>
								<p class="text-4xl font-extrabold">
									{vote.value}
								</p>
							</div>
						</figure>
						<div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
							<p class="w-full content text-lg">
								{vote.message}
							</p>
							<div class="w-full mt-4 flex justify-between items-center">
								<p class="text-base opacity-70">
									{#if vote.id}
										#{vote.id}
									{/if}
								</p>
								<p class="text-sm opacity-70 text-right">
									{#if vote.user}
										<a
											href={`/users/${vote.user.id}`}
											target="_blank"
											rel="noreferrer"
											class="hover:underline">{vote.user.username}</a
										> @
									{/if}
									{parseDateTime(vote.time)}
								</p>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
		{#if content.song && typeof content.song == "object"}
			<div class="mx-4 w-80 form-control">
				<div class="indicator my-4 w-full">
					<span
						class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("song.song")}</span
					>
					<Song song={content.song} token={access_token} {user} />
				</div>
			</div>
		{/if}
	</div>
{/if}

<style>
	.main-width {
		width: calc(min(100%, 880px) - 80px);
	}
</style>
