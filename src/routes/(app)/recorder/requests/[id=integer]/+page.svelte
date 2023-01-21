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

	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

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
		const resp = await api.PATCH(
			`/recorder/requests/${content?.id}/`,
			{
				attitude: requestStatus,
				reply: reply,
			},
			access_token,
			user
		);
		if (resp.ok) {
			window.location.href = `/recorder/requests/${content?.id}`;
		} else {
			console.log(await resp.json());
		}
	};

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

<svelte:head>
	<title
		>{$t("recorder.request")} - {content?.name} [{content?.level}{content?.difficulty}]
		| {$t("common.title")}</title
	>
</svelte:head>

{#if status === Status.OK && content !== null}
	<input type="checkbox" id="recorder-manage-request" class="modal-toggle" />
	<div class="modal">
		<div class="modal-box bg-base-100">
			<h3 class="font-bold text-lg">{$t("recorder.reply_v")}</h3>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("recorder.status")}</span
				>
				<select
					bind:value={requestStatus}
					class="select select-primary w-full max-w-xs"
				>
					<option value="1">{$t("recorder.statuses.1")}</option>
					<option value="2">{$t("recorder.statuses.2")}</option>
					<option value="3">{$t("recorder.statuses.3")}</option>
				</select>
			</label>
			<label class="input-group my-2">
				<span class="w-1/4 min-w-[64px] max-w-[180px]"
					>{$t("recorder.reply")}</span
				><textarea
					class="textarea textarea-primary w-full max-w-xs h-48"
					placeholder={$t("write_reply")}
					bind:value={reply}
				/>
			</label>
			<div class="modal-action btn-group btn-group-horizontal">
				<label
					for="recorder-manage-request"
					class="btn btn-primary btn-outline text-lg">{$t("common.back")}</label
				>
				<label
					for="recorder-manage-request"
					class="btn btn-primary btn-outline text-lg"
					on:click={handleSubmit}
					on:keyup>{$t("common.submit")}</label
				>
			</div>
		</div>
	</div>
	<div class="bg-base-200 page py-24 px-12 justify-center flex">
		<div class="mx-4 min-w-[540px] max-w-[1400px] main-width">
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("recorder.req")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="text-5xl py-3 flex font-bold gap-4 items-center">
							{content.name}
							<button class="btn btn-secondary btn-sm text-2xl no-animation">
								{content.level}
								{content.difficulty}
							</button>
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
									>{$t("common.form.chart_level")}</span
								>
								{content.level}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.chart_difficulty_1")}</span
								>
								{content.difficulty}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("common.form.chart")}</span
								>
								<a
									href={content.chart}
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
							{#if content.tip && content.charter && content.composer && content.illustrator}
								<p>
									<span class="badge badge-primary badge-outline mr-1"
										>{$t("common.form.charter")}</span
									>
									{content.charter}
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
										download
									>
										{$t("common.download")}
									</a>
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
							{#if content.avatar && content.challenge_color !== null && content.challenge_color >= 0 && content.challenge_color <= 4}
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
									>{$t("recorder.requested_at")}</span
								>
								{parseDateTime(content.requested_at)}
							</p>
							<p>
								<span class="badge badge-primary badge-outline mr-1"
									>{$t("recorder.status")}</span
								>
								{$t(`recorder.statuses.${content.status}`)}
							</p>
						</div>
						{#if getUserPrivilege(user.type) >= 3}
							<div class="card-actions flex items-center justify-end">
								<label
									for="recorder-manage-request"
									class="btn btn-primary btn-outline glass text-lg w-32"
									>{$t("recorder.reply")}</label
								>
							</div>
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
						class="card card-side w-full bg-base-100 border border-base-300 shadow-lg"
					>
						<figure class="w-1/6 min-w-fit">
							<div
								class="relative inline-flex items-center form-control border-r border-base-300 px-3 py-3 mx-auto my-auto"
							>
								<div
									class={`w-[72px] rounded-full overflow-hidden border-[3px] border-opacity-80 ${
										content.replier.type == "admin"
											? "border-indigo-500"
											: user.type == "volunteer"
											? "border-emerald-500"
											: user.type == "qualified"
											? "border-sky-500"
											: "border-neutral-500"
									}`}
								>
									<a
										
										href={`/users/${content.replier.id}`}
									>
										<img
											class="object-fill"
											src={getCompressedImage(content.replier.avatar)}
											alt="Avatar"
										/>
									</a>
								</div>
								<a
									
									href={`/users/${content.user.id}`}
								>
									<p class="text-lg text-center max-w-[120px] break-all">
										{content.replier.username}
									</p>
								</a>
								<div class="flex gap-1 aspect-[21/5]">
									<span class="badge badge-sm font-bold"
										>LV{getUserLevel(content.replier.exp)}</span
									>
									{#if content.replier.tag}
										<span class="badge badge-sm badge-accent"
											>{content.replier.tag}</span
										>
									{/if}
								</div>
							</div>
						</figure>
						<div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
							<p class="w-full content text-lg">
								{content.reply}
							</p>
							<div class="card-actions mt-4 flex justify-between items-center">
								<p class="text-sm opacity-70">
									{parseDateTime(content.replied_at)}
								</p>
							</div>
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
