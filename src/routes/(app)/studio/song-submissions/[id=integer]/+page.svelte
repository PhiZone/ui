<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import {
		getCompressedImage,
		getUserLevel,
		getUserPrivilege,
		parseDateTime,
	} from "$lib/utils";
	import { onMount } from "svelte";
	import * as api from "$lib/api";
	import Chapter from "$lib/components/chapter.svelte";

	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let submissionStatus: number, reply: string;

	onMount(() => {
		if (status === Status.OK && content) {
			submissionStatus = content.status;
		} else if (error) {
			console.log(error);
		}
	});
	const handleSubmit = async () => {
		const resp = await api.POST(
			"/review/",
			{
				song_upload: content?.id,
				attitude: submissionStatus,
				message: reply,
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
		{$t("studio.song_submission")} - {content?.name} | {$t("common.title")}
	</title>
</svelte:head>

{#if status === Status.OK && content !== null}
	<input type="checkbox" id="studio-song-submission" class="modal-toggle" />
	<div class="modal">
		<div class="modal-box bg-base-100">
			<h3 class="font-bold text-lg">{$t("studio.submission.reply_v")}</h3>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("studio.submission.status")}</span
				>
				<select
					bind:value={submissionStatus}
					class="select select-primary w-3/4"
				>
					<option value="1"
						>{$t("studio.submission.volunteer_statuses.1")}</option
					>
					<option value="2"
						>{$t("studio.submission.volunteer_statuses.2")}</option
					>
				</select>
			</label>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("studio.submission.reply")}</span
				><textarea
					class="textarea textarea-primary w-3/4 h-48"
					placeholder={$t("common.write_reply")}
					bind:value={reply}
				/>
			</label>
			<div class="modal-action btn-group btn-group-horizontal">
				<label
					for="studio-song-submission"
					class="btn btn-primary btn-outline text-lg">{$t("common.back")}</label
				>
				<label
					for="studio-song-submission"
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
					>{$t("studio.song_submission")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex font-bold gap-4 items-center">
							{content.name}
						</div>
						<div>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.song_name")}</span
								>
								{content.name}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.audio")}</span
								>
								<a
									href={content.song}
									target="_blank"
									rel="noreferrer"
									class="hover:underline underline-offset-2"
									download
								>
									{$t("common.download")}
								</a>
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.illustration")}</span
								>
								<a
									href={content.illustration}
									target="_blank"
									rel="noreferrer"
									class="hover:underline underline-offset-2"
									download
								>
									{$t("common.download")}
								</a>
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("song.edition")}</span
								>
								{content.edition}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.composer")}</span
								>
								{content.composer}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.illustrator")}</span
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
								{content.offset}
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
									>{$t("studio.submission.status")}</span
								>
								{$t(`studio.submission.volunteer_statuses.${content.status}`)}
							</p>
							{#if content.message}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("studio.submission.reply")}</span
									>
									{content.message}
								</p>
							{/if}
							{#if content.description}
								<p class="content">
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("common.description")}</span
									>
									{content.description}
								</p>
							{/if}
						</div>
						<div class="card-actions flex items-center justify-between">
							<audio class="w-3/5" controls src={content.song} />
							{#if getUserPrivilege(user.type) >= 3}
								<label
									for="studio-song-submission"
									class="btn btn-primary btn-outline glass text-lg w-32"
									>{$t("studio.submission.reply_v")}</label
								>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>
		{#if typeof content.chapters == "object" && content.chapters.length > 0}
			<div class="mx-4 w-80 form-control">
				{#each content.chapters as chapter}
					<div class="indicator my-4 w-full">
						<span
							class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
							>{$t("song.chapter")}</span
						>
						<Chapter {chapter} token={access_token} {user} />
					</div>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.main-width {
		width: calc(min(100%, 880px) - 80px);
	}
</style>
