<script lang="ts">
	import { t } from "$lib/translations/config";
	import * as api from "$lib/api";
	import { ContentType, Status } from "$lib/constants";
	import { goto } from "$app/navigation";
	import type { RecorderRequestError } from "$lib/models";

	export let data: import("./$types").PageData;
	$: ({ access_token, user } = data);

	let errorMsg = "",
		songName = "",
		level = "",
		difficulty = "",
		charter = "",
		composer = "",
		illustrator = "",
		noteSize = "",
		resolution = "",
		audio_option = 1,
		loadingOption = true,
		endingOption = false,
		tip = "",
		username = "",
		totalScore = "",
		rks = "",
		challengeColor = 0,
		challengeDifficulty = "",
		addition = "",
		chart: File | null = null,
		song: File | null = null,
		illustration: File | null = null,
		avatar: File | null = null,
		status = Status.OK,
		dataIncomplete = false,
		error: RecorderRequestError;

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

	const handleChart = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		if (error?.chart) error.chart = [];
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			chart = target.files[0];
		}
	};

	const handleSong = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		if (error?.song) error.song = [];
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			song = target.files[0];
		}
	};

	const handleIllustration = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		if (error?.illustration) error.illustration = [];
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			illustration = target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(illustration);
			reader.onload = () => {
				// console.log(reader.result);
			};
		}
	};

	const handleAvatar = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		if (error?.avatar) error.avatar = [];
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			avatar = target.files[0];
		}
	};

	async function handleSubmit() {
		dataIncomplete =
			!(
				song &&
				chart &&
				illustration &&
				songName &&
				level &&
				difficulty &&
				noteSize &&
				resolution &&
				totalScore
			) ||
			(loadingOption && !(composer && illustrator && charter && tip)) ||
			(endingOption &&
				!(
					avatar &&
					username &&
					rks &&
					challengeColor >= 0 &&
					challengeColor <= 4 &&
					challengeDifficulty
				));
		if (dataIncomplete) {
			errorMsg = "data_incomplete";
			status = Status.ERROR;
			return;
		}
		let formData = new FormData();
		formData.append("name", songName);
		formData.append("chart", chart as unknown as File);
		formData.append("song", song as unknown as File);
		formData.append("illustration", illustration as unknown as File);
		formData.append("level", level);
		formData.append("difficulty", difficulty);
		formData.append("note_size", noteSize);
		formData.append("resolution", resolution);
		formData.append("audio_option", audio_option.toString());
		formData.append("total_score", totalScore);
		if (loadingOption) {
			formData.append("charter", charter);
			formData.append("composer", composer);
			formData.append("illustrator", illustrator);
			formData.append("tip", tip);
		}
		if (endingOption) {
			formData.append("avatar", avatar as unknown as File);
			formData.append("username", username);
			formData.append("rks", rks);
			formData.append("challenge_color", challengeColor.toString());
			formData.append("challenge_difficulty", challengeDifficulty);
		}
		formData.append("addition", addition);
		status = Status.SENDING;
		const resp = await api.POST(
			"/recorder/requests/",
			formData,
			access_token,
			user,
			ContentType.FORM_DATA
		);
		if (resp.ok) {
			goto(`/recorder/requests`);
		} else {
			error = await resp.json();
			console.log(error);
			if (resp.status == 400) {
				errorMsg = "data_invalid";
			} else {
				errorMsg = error.detail ? "" : "unknown_error";
			}
			status = Status.ERROR;
		}
	}
</script>

<svelte:head>
	<title
		>{$t("recorder.request")} - {$t("recorder.new_request")} | {$t(
			"common.title"
		)}</title
	>
</svelte:head>

<div class="bg-base-200 page">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-6xl min-w-20">
			<h1 class="text-4xl font-bold mb-6">{$t("recorder.new_request")}</h1>
			<div class="card w-full bg-base-100 shadow-lg">
				<div class="card-body">
					<div
						class="form-control"
						on:focusin={() => {
							status = Status.OK;
						}}
					>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("common.form.audio")}</span
							>
							<input
								type="file"
								accept=".mp3, .ogg, .oga"
								class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
									(!song && dataIncomplete) ||
									(status === Status.ERROR && error?.song)
										? "input-error file:btn-error"
										: "input-primary file:btn-outline file:bg-primary"
								}`}
								on:change={handleSong}
							/>
							{#if status === Status.ERROR && error?.song}
								<span class="place-self-center text-error">{error.song}</span>
							{:else}
								<span class="place-self-center"
									>{$t("common.form.tips.audio")}</span
								>
							{/if}
						</div>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("common.form.chart")}</span
							>
							<input
								type="file"
								accept=".json"
								class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
									(!chart && dataIncomplete) ||
									(status === Status.ERROR && error?.chart)
										? "input-error file:btn-error"
										: "input-primary file:btn-outline file:bg-primary"
								}`}
								on:change={handleChart}
							/>
							{#if status === Status.ERROR && error?.chart}
								<span class="place-self-center text-error">{error.chart}</span>
							{:else}
								<span class="place-self-center"
									>{$t("recorder.chart_placeholder")}</span
								>
							{/if}
						</div>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("common.form.illustration")}</span
							>
							<input
								type="file"
								accept=".jpg, .jpeg, .png"
								class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
									(!illustration && dataIncomplete) ||
									(status === Status.ERROR && error?.illustration)
										? "input-error file:btn-error"
										: "input-primary file:btn-outline file:bg-primary"
								}`}
								on:change={handleIllustration}
							/>
							{#if status === Status.ERROR && error?.illustration}
								<span class="place-self-center text-error"
									>{error.illustration}</span
								>
							{:else}
								<span class="place-self-center"
									>{$t("recorder.illustration_placeholder")}</span
								>
							{/if}
						</div>
						<div
							class={status === Status.ERROR && error?.name
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.name
								? error.name
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("common.form.song_name")}</span
								>
								<input
									type="text"
									placeholder={$t("common.form.song_name")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!songName && dataIncomplete) ||
										(status === Status.ERROR && error?.name)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={songName}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.level
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.level
								? error.level
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("common.form.chart_level")}</span
								>
								<input
									type="text"
									placeholder={$t("common.form.tips.chart_level")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!level && dataIncomplete) ||
										(status === Status.ERROR && error?.level)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={level}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.difficulty
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.difficulty
								? error.difficulty
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("common.form.chart_difficulty_1")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.difficulty_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!difficulty && dataIncomplete) ||
										(status === Status.ERROR && error?.difficulty)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={difficulty}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.note_size
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.note_size
								? error.note_size
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("recorder.note_size")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.note_size_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!noteSize && dataIncomplete) ||
										(status === Status.ERROR && error?.note_size)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={noteSize}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.resolution
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.resolution
								? error.resolution
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("recorder.resolution")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.resolution_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!resolution && dataIncomplete) ||
										(status === Status.ERROR && error?.resolution)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={resolution}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.total_score
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.total_score
								? error.total_score
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("recorder.total_score")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.total_score_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!totalScore && dataIncomplete) ||
										(status === Status.ERROR && error?.total_score)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={totalScore}
								/>
							</label>
						</div>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("recorder.audio_option")}</span
							>
							<div class="form-control">
								<div class="pt-3">
									<input
										type="radio"
										bind:group={audio_option}
										name="audio_option"
										value="1"
										class="radio radio-primary mr-2"
										checked
									/>
									<div class="choice">
										{$t("recorder.audio_option_1")}
									</div>
								</div>
								<div class="pt-3">
									<input
										type="radio"
										bind:group={audio_option}
										name="audio_option"
										value="2"
										class="radio radio-primary mr-2"
									/>
									<div class="choice">
										{$t("recorder.audio_option_2")}
									</div>
								</div>
							</div>
						</div>
						<div class="flex my-3">
							<span class="w-32 px-4 place-self-center"
								>{$t("recorder.loading_option")}</span
							>
							<input
								type="checkbox"
								bind:checked={loadingOption}
								class="checkbox checkbox-primary"
							/>
						</div>
						{#if loadingOption}
							<div
								class={status === Status.ERROR && error?.composer
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.composer
									? error.composer
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("common.form.composer")}</span
									>
									<input
										type="text"
										placeholder={$t("common.form.composer")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											loadingOption &&
											((!composer && dataIncomplete) ||
												(status === Status.ERROR && error?.composer))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={composer}
									/>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.charter
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.charter
									? error.charter
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("common.form.charter")}</span
									>
									<input
										type="text"
										placeholder={$t("common.form.charter")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											loadingOption &&
											((!charter && dataIncomplete) ||
												(status === Status.ERROR && error?.charter))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={charter}
									/>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.illustrator
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.illustrator
									? error.illustrator
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("common.form.illustrator")}</span
									>
									<input
										type="text"
										placeholder={$t("common.form.illustrator")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											loadingOption &&
											((!illustrator && dataIncomplete) ||
												(status === Status.ERROR && error?.illustrator))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={illustrator}
									/>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.tip
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.tip
									? error.tip
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]">{$t("recorder.tip")}</span>
									<input
										type="text"
										placeholder={$t("recorder.tip")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											loadingOption &&
											((!tip && dataIncomplete) ||
												(status === Status.ERROR && error?.tip))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={tip}
									/>
								</label>
							</div>
						{/if}
						<div class="flex my-3">
							<span class="w-32 px-4 place-self-center"
								>{$t("recorder.ending_option")}</span
							>
							<input
								type="checkbox"
								bind:checked={endingOption}
								class="checkbox checkbox-primary"
							/>
						</div>
						{#if endingOption}
							<div class="flex">
								<span class="w-32 px-4 place-self-center"
									>{$t("recorder.avatar")}</span
								>
								<input
									type="file"
									accept=".jpg, .jpeg, .png"
									class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
										(!song && dataIncomplete) ||
										(status === Status.ERROR && error?.avatar)
											? "input-error file:btn-error"
											: "input-primary file:btn-outline file:bg-primary"
									}`}
									on:change={handleAvatar}
								/>
								{#if status === Status.ERROR && error?.avatar}
									<span class="place-self-center text-error"
										>{error.avatar}</span
									>
								{:else}
									<span class="place-self-center"
										>{$t("recorder.illustration_placeholder")}</span
									>
								{/if}
							</div>
							<div
								class={status === Status.ERROR && error?.username
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.username
									? error.username
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("recorder.username")}</span
									>
									<input
										type="text"
										placeholder={$t("recorder.username")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											endingOption &&
											((!username && dataIncomplete) ||
												(status === Status.ERROR && error?.username))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={username}
									/>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.rks
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.rks
									? error.rks
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]">{$t("recorder.rks")}</span>
									<input
										type="text"
										placeholder={(Math.random() * (16.12 - 12) + 12).toFixed(2)}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											endingOption &&
											((!rks && dataIncomplete) ||
												(status === Status.ERROR && error?.rks))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={rks}
									/>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.challenge_color
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.challenge_color
									? error.challenge_color
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("recorder.challenge_color")}</span
									>
									<select
										bind:value={challengeColor}
										class={`select select-bordered select-primary w-3/4 min-w-[180px] ${
											endingOption &&
											((!(challengeColor >= 0 && challengeColor <= 4) &&
												dataIncomplete) ||
												(status === Status.ERROR && error?.challenge_color))
												? "input-error"
												: "input-primary"
										}`}
									>
										{#each challengeColors as c}
											<option value={c.id}>{c.text}</option>
										{/each}
									</select>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.challenge_difficulty
									? "tooltip tooltip-open tooltip-right tooltip-error"
									: ""}
								data-tip={status === Status.ERROR && error?.challenge_difficulty
									? error.challenge_difficulty
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("recorder.challenge_difficulty")}</span
									>
									<input
										type="text"
										placeholder={$t("recorder.challenge_difficulty")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											endingOption &&
											((!challengeDifficulty && dataIncomplete) ||
												(status === Status.ERROR &&
													error?.challenge_difficulty))
												? "input-error"
												: "input-primary"
										}`}
										bind:value={challengeDifficulty}
									/>
								</label>
							</div>
						{/if}
						<div
							class={status === Status.ERROR && error?.addition
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.addition
								? error.addition
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]">{$t("recorder.addition")}</span
								><textarea
									class={`textarea ${
										endingOption &&
										((!addition && dataIncomplete) ||
											(status === Status.ERROR && error?.addition))
											? "textarea-error"
											: "textarea-primary"
									} w-3/4 h-48`}
									placeholder={$t("recorder.addition_placeholder")}
									bind:value={addition}
								/>
							</label>
						</div>
					</div>
				</div>
			</div>
			<button
				class={`btn btn-outline ${
					status === Status.ERROR
						? "btn-disabled tooltip tooltip-open tooltip-left tooltip-error"
						: status === Status.SENDING
						? "btn btn-outline btn-ghost btn-disabled glass"
						: "btn-primary"
				} glass float-right my-5 text-lg`}
				data-tip={errorMsg
					? $t(`recorder.${errorMsg}`)
					: typeof error?.detail === "string"
					? error?.detail
					: ""}
				on:click={handleSubmit}
				>{$t(
					status === Status.SENDING ? "common.waiting" : "common.submit"
				)}</button
			>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
	.choice {
		float: right;
		width: calc(100% - 32px);
	}
</style>
