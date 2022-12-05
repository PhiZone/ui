<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import { getUserPrivilege, parseDateTime } from "$lib/utils";
	import { onMount } from "svelte";
	import * as api from '$lib/api';

	export let data: import("./$types").PageData;
	$: ({ status, content, error, token, user } = data);
	let requestStatus: number, reply: string | null;
	onMount(() => {
		if (status === Status.OK && content) {
			requestStatus = content.status;
			reply = content.reply;
		} else if (error) {
			console.log(error);
		}
	});
	const handleSubmit = async () => {
		const resp = await api.PATCH(`recorder/requests/${content?.id}/`, {
			'attitude': requestStatus,
			'reply': reply
		}, token);
		if (resp.ok) {
			window.location.href = `/recorder/requests/${content?.id}`
		} else {
			console.log(await resp.json());
		}
	}

let challengeColors = [
	{
		id: 0,
		text: "Rainbow",
		image: "https://res.phi.zone/static/challenge_rainbow.png",
	},
	{
		id: 1,
		text: "Gold",
		image: "https://res.phi.zone/static/challenge_gold.png",
	},
	{
		id: 2,
		text: "Orange",
		image: "https://res.phi.zone/static/challenge_orange.png",
	},
	{
		id: 3,
		text: "Blue",
		image: "https://res.phi.zone/static/challenge_blue.png",
	},
	{
		id: 4,
		text: "Green",
		image: "https://res.phi.zone/static/challenge_green.png",
	},
];
</script>

{#if status === Status.OK && content !== null}
	<input type="checkbox" id="recorder-manage-request" class="modal-toggle" />
	<div class="modal">
		<div class="modal-box">
			<h3 class="font-bold text-lg">{$t("recorder.reply")}</h3>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("recorder.status")}</span
				>
				<select
					bind:value={requestStatus}
					class="select select-primary w-full max-w-xs"
				>
					<option value="1">{$t("recorder.status_1")}</option>
					<option value="2">{$t("recorder.status_2")}</option>
					<option value="3">{$t("recorder.status_3")}</option>
				</select>
			</label>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("recorder.reply")}</span
				><textarea
					class="textarea textarea-primary w-full max-w-xs h-48"
					placeholder={$t("recorder.reply")}
					bind:value={reply}
				/>
			</label>
			<div class="modal-action btn-group btn-group-horizontal">
				<label for="recorder-manage-request" class="btn btn-primary text-lg">{$t('common.back')}</label>
				<label for="recorder-manage-request" class="btn btn-primary text-lg" on:click={handleSubmit} on:keydown={handleSubmit}>{$t('common.submit')}</label>
			</div>
		</div>
	</div>
	<div class="bg-base-200 py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[540px] max-w-[1400px] main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("recorder.request")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-2xl bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex items-center">
							{content.name}
							<div
								class="ml-3 badge badge-lg badge-primary min-w-fit h-10 text-2xl"
							>
								{content.level}
								{content.difficulty}
							</div>
						</div>
						<div>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.chart")}</span
								>
								<a
									href={content.chart}
									target="_blank"
									rel="noreferrer"
									class="hover:underline underline-offset-2"
									>{$t("common.download")}</a
								>
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.song")}</span
								>
								<a
									href={content.song}
									target="_blank"
									rel="noreferrer"
									class="hover:underline underline-offset-2"
									>{$t("common.download")}</a
								>
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.illustration")}</span
								>
								<a
									href={content.illustration}
									target="_blank"
									rel="noreferrer"
									class="hover:underline underline-offset-2"
									>{$t("common.download")}</a
								>
							</p>
							{#if content.tip && content.charter && content.composer && content.illustrator}
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.charter")}</span
								>
								{content.charter}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.composer")}</span
								>
								{content.composer}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.illustrator")}</span
								>
								{content.illustrator}
							</p>
							{/if}
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.note_size")}</span
								>
								{content.note_size}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.resolution")}</span
								>
								{content.resolution}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.audio_option")}</span
								>
								{$t(`recorder.audio_option_${content.audio_option}`)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.total_score")}</span
								>
								{content.total_score}
							</p>
							{#if content.tip && content.charter && content.composer && content.illustrator}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.tip")}</span
									>
									{content.tip}
								</p>
							{/if}
							{#if content.avatar}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.avatar")}</span
									>
									<a
										href={content.avatar}
										target="_blank"
										rel="noreferrer"
										class="hover:underline underline-offset-2"
										>{$t("common.download")}</a
									>
								</p>
							{/if}
							{#if content.avatar && content.username}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.username")}</span
									>
									{content.username}
								</p>
							{/if}
							{#if content.avatar && content.rks}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.rks")}</span
									>
									{content.rks}
								</p>
							{/if}
							{#if content.avatar && content.challenge_color != null && content.challenge_color >= 0 && content.challenge_color <= 4}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.challenge_color")}</span
									>
									{challengeColors[content.challenge_color].text}
								</p>
							{/if}
							{#if content.avatar && content.challenge_difficulty}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.challenge_difficulty")}</span
									>
									{content.challenge_difficulty}
								</p>
							{/if}
							{#if content.addition}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.addition")}</span
									>
									{content.addition}
								</p>
							{/if}
							{#if getUserPrivilege(user.type) >= 3}
								<p class="min-w-fit">
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.requester")}</span
									>
									{content.user.username}
								</p>
							{/if}
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.status")}</span
								>
								{$t(`recorder.status_${content.status}`)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.requested_at")}</span
								>
								{parseDateTime(content.requested_at)}
							</p>
							{#if content.reply && content.replier && content.replied_at}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("recorder.replied_at")}</span
									>
									{parseDateTime(content.replied_at)}
								</p>
							{/if}
						</div>
						{#if getUserPrivilege(user.type) >= 3}
						<label
							for="recorder-manage-request"
							class="btn btn-primary text-lg w-32"
							>{$t("recorder.reply")}</label
						>
						{/if}
					</div>
				</div>
			</div>
			{#if content.reply && content.replier && content.replied_at}
				<div class="indicator w-full my-4">
					<span
						class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
						>{$t("recorder.reply")}</span
					>
					<div
						class="card card-side w-full bg-base-100 border border-base-300 shadow-xl"
					>
						<figure>
							<div
								class="avatar items-center min-w-fit flex-col border-r border-base-300 px-6 py-3"
							>
								<div class="w-16 rounded-full">
									<img src={content.replier.avatar} alt="Avatar" />
								</div>
								<p class="text-lg">{content.replier.username}</p>
							</div>
						</figure>
						<div class="card-body">
							<p>{content.reply}</p>
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
