<script lang="ts">
	import { t } from "$lib/translations/config";
	import * as api from "$lib/api";
	import { ContentType, Status } from "$lib/constants";
	import { goto } from "$app/navigation";

	export let data: import("./$types").PageData;
	$: ({ access_token } = data);

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
		challengeColor = "",
		challengeDifficulty = "",
		addition = "",
		chart: File | null = null,
		song: File | null = null,
		illustration: File | null = null,
		avatar: File | null = null,
		status = Status.OK;

	let challenge_colors = [
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
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			chart = target.files[0];
		}
	};

	const handleSong = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			song = target.files[0];
		}
	};

	const handleIllustration = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			illustration = target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(illustration);
			reader.onload = () => {
				console.log(reader.result);
			};
		}
	};

	const handleAvatar = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			avatar = target.files[0];
		}
	};

	async function handleSubmit() {
		if (
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
				!(avatar && username && rks && challengeColor && challengeDifficulty))
		) {
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
			formData.append("challenge_color", challengeColor);
			formData.append("challenge_difficulty", challengeDifficulty);
		}
		formData.append("addition", addition);
		status = Status.WAITING;
		const resp = await api.POST(
			"recorder/requests/",
			formData,
			access_token,
			ContentType.FORM_DATA
		);
		if (resp.ok) {
			goto(`/recorder/requests`);
		} else {
			console.log(await resp.json());
			if (resp.status == 400) {
				errorMsg = "data_invalid";
			} else {
				errorMsg = "unknown_error"
			}
			status = Status.ERROR;
		}
	}
</script>

<div class="bg-base-100">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-6xl min-w-20">
			<h1 class="text-4xl font-bold mb-6">{$t("recorder.new_request")}</h1>
			<div class="card w-full bg-base-100 shadow-xl">
				<div class="card-body">
					<div
						class="form-control"
						on:focusin={() => {
							status = Status.OK;
						}}
					>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("recorder.chart")}</span
							>
							<input
								type="file"
								accept=".json, .pec"
								class="mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
								on:change={handleChart}
							/>
							<span class="place-self-center"
								>{$t("recorder.chart_placeholder")}</span
							>
						</div>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("recorder.song")}</span
							>
							<input
								type="file"
								accept=".mp3, .ogg, .oga"
								class="mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
								on:change={handleSong}
							/>
							<span class="place-self-center"
								>{$t("recorder.song_placeholder")}</span
							>
						</div>
						<div class="flex">
							<span class="w-32 px-4 place-self-center"
								>{$t("recorder.illustration")}</span
							>
							<input
								type="file"
								accept=".jpg, .jpeg, .png"
								class="mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
								on:change={handleIllustration}
							/>
							<span class="place-self-center"
								>{$t("recorder.illustration_placeholder")}</span
							>
						</div>
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.name")}</span
							>
							<input
								type="text"
								placeholder={$t("recorder.name")}
								class="input input-bordered input-primary w-3/4 min-w-[180px]"
								bind:value={songName}
							/>
						</label>
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.level")}</span
							>
							<input
								type="text"
								placeholder={$t("recorder.level_holder")}
								class="input input-bordered input-primary w-3/4 min-w-[180px]"
								bind:value={level}
							/>
						</label>
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.difficulty")}</span
							>
							<input
								type="text"
								placeholder={$t("recorder.difficulty_holder")}
								class="input input-bordered input-primary w-3/4 min-w-[180px]"
								bind:value={difficulty}
							/>
						</label>
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.note_size")}</span
							>
							<input
								type="text"
								placeholder={$t("recorder.note_size_placeholder")}
								class="input input-bordered input-primary w-3/4 min-w-[180px]"
								bind:value={noteSize}
							/>
						</label>
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.resolution")}</span
							>
							<input
								type="text"
								placeholder={$t("recorder.resolution_placeholder")}
								class="input input-bordered input-primary w-3/4 min-w-[180px]"
								bind:value={resolution}
							/>
						</label>
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.total_score")}</span
							>
							<input
								type="text"
								placeholder={$t("recorder.total_score_placeholder")}
								class="input input-bordered input-primary w-3/4 min-w-[180px]"
								bind:value={totalScore}
							/>
						</label>
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
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.composer")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.composer")}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={composer}
								/>
							</label>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.charter")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.charter")}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={charter}
								/>
							</label>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.illustrator")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.illustrator")}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={illustrator}
								/>
							</label>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.tip")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.tip")}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={tip}
								/>
							</label>
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
									class="mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn file:btn-outline file:bg-primary"
									on:change={handleAvatar}
								/>
								<span class="place-self-center"
									>{$t("recorder.illustration_placeholder")}</span
								>
							</div>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.username")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.username")}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={username}
								/>
							</label>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.rks")}</span
								>
								<input
									type="text"
									placeholder={(Math.random() * (16.12 - 12) + 12).toFixed(2)}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={rks}
								/>
							</label>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.challenge_color")}</span
								>
								<select
									bind:value={challengeColor}
									class="select select-bordered select-primary w-3/4 min-w-[180px]"
								>
									{#each challenge_colors as c}
										<option value={c.id}>{c.text}</option>
									{/each}
								</select>
							</label>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px] max-w-[180px]"
									>{$t("recorder.challenge_difficulty")}</span
								>
								<input
									type="text"
									placeholder={$t("recorder.challenge_difficulty")}
									class="input input-bordered input-primary w-3/4 min-w-[180px]"
									bind:value={challengeDifficulty}
								/>
							</label>
						{/if}
						<label class="input-group my-2">
							<span class="w-1/4 min-w-[64px] max-w-[180px]"
								>{$t("recorder.addition")}</span
							><textarea
								class="textarea textarea-primary w-3/4 h-48"
								placeholder={$t("recorder.addition_placeholder")}
								bind:value={addition}
							/>
						</label>
					</div>
				</div>
			</div>
			<button
				class={`btn btn-outline ${
					status === Status.ERROR
						? "btn-disabled tooltip tooltip-open tooltip-left tooltip-error"
						: status === Status.WAITING ? "btn btn-outline btn-ghost btn-disabled glass" : "btn-primary"
				} glass float-right my-5 text-lg`}
				data-tip={$t(`recorder.${errorMsg}`)}
				on:click={handleSubmit}>{$t(status == Status.WAITING ? "common.waiting" : "common.submit")}</button
			>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", sans-serif;
	}
	.choice {
		float: right;
		width: calc(100% - 32px);
	}
</style>
