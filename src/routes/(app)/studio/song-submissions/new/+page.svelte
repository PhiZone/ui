<script lang="ts">
	import { t } from "$lib/translations/config";
	import * as api from "$lib/api";
	import { ContentType, Status } from "$lib/constants";
	import { goto } from "$app/navigation";
	import type { Chapter, SongSubmissionError } from "$lib/models";

	export let data: import("./$types").PageData;
	$: ({ access_token, user } = data);

	let errorMsg = "",
		songName = "",
		edition = "",
		composer = "",
		illustrator = "",
		bpm = "",
		offset = "",
		previewStart = "",
		previewEnd = "",
		description = "",
		chapters = "",
		song: File | null = null,
		illustration: File | null = null,
		status = Status.OK,
		dataIncomplete = false,
		error: SongSubmissionError,
		chapterList: Chapter[];

	const getChapters = async () => {
		if (chapterList) {
			return;
		}
		const resp = await api.GET(
			"/chapters/?accessibility=0&pagination=0",
			access_token,
			user
		);
		if (resp.ok) {
			chapterList = await resp.json();
		} else {
			console.log(await resp.json());
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
				console.log(reader.result);
			};
		}
	};

	async function handleSubmit() {
		dataIncomplete = !(
			song &&
			illustration &&
			songName &&
			edition &&
			composer &&
			illustrator &&
			bpm &&
			offset &&
			previewStart &&
			previewEnd
		);
		if (dataIncomplete) {
			errorMsg = "data_incomplete";
			status = Status.ERROR;
			return;
		}
		let formData = new FormData();
		formData.append("name", songName);
		formData.append("song", song as unknown as File);
		formData.append("illustration", illustration as unknown as File);
		formData.append("edition", edition);
		formData.append("composer", composer);
		formData.append("illustrator", illustrator);
		formData.append("bpm", bpm);
		formData.append("offset", offset);
		formData.append("preview_start", `00:${previewStart}`);
		formData.append("preview_end", `00:${previewEnd}`);
		formData.append("description", description);
		formData.append("chapters", chapters);
		status = Status.SENDING;
		const resp = await api.POST(
			"/song_uploads/",
			formData,
			access_token,
			user,
			ContentType.FORM_DATA
		);
		if (resp.ok) {
			goto("/studio/song-submissions");
		} else {
			error = await resp.json();
			console.log(error);
			if (resp.status == 400) {
				errorMsg = "data_invalid";
			} else {
				errorMsg = "unknown_error";
			}
			status = Status.ERROR;
		}
	}
</script>

<svelte:head>
	<title
		>{$t("common.studio")} - {$t("studio.upload_song")} | {$t(
			"common.title"
		)}</title
	>
</svelte:head>

<div class="bg-base-200 min-h-screen">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-6xl min-w-20">
			<h1 class="text-4xl font-bold mb-6">{$t("studio.upload_song")}</h1>
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
									>{$t("common.form.tips.illustration")}</span
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
							class={status === Status.ERROR && error?.edition
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.edition
								? error.edition
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]">{$t("song.edition")}</span>
								<input
									type="text"
									placeholder={$t("studio.submission.edition_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!edition && dataIncomplete) ||
										(status === Status.ERROR && error?.edition)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={edition}
								/>
							</label>
						</div>
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
										(!composer && dataIncomplete) ||
										(status === Status.ERROR && error?.composer)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={composer}
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
										(!illustrator && dataIncomplete) ||
										(status === Status.ERROR && error?.illustrator)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={illustrator}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.bpm
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.bpm ? error.bpm : ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]">{$t("song.bpm")}</span>
								<input
									type="text"
									placeholder={$t("studio.submission.bpm_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!bpm && dataIncomplete) ||
										(status === Status.ERROR && error?.bpm)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={bpm}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.offset
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.offset
								? error.offset
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]">{$t("song.offset")}</span>
								<input
									type="text"
									placeholder={$t("studio.submission.offset_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!offset && dataIncomplete) ||
										(status === Status.ERROR && error?.offset)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={offset}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.preview_start
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.preview_start
								? error.preview_start[0].replace("hh:mm[:ss[.uuuuuu]]", "mm:ss")
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("studio.submission.preview_start")}</span
								>
								<input
									type="text"
									placeholder={$t("studio.submission.preview_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!previewStart && dataIncomplete) ||
										(status === Status.ERROR && error?.preview_start)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={previewStart}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.preview_end
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.preview_end
								? error.preview_end[0].replace("hh:mm[:ss[.uuuuuu]]", "mm:ss")
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]"
									>{$t("studio.submission.preview_end")}</span
								>
								<input
									type="text"
									placeholder={$t("studio.submission.preview_placeholder")}
									class={`input input-bordered w-3/4 min-w-[180px] ${
										(!previewEnd && dataIncomplete) ||
										(status === Status.ERROR && error?.preview_end)
											? "input-error"
											: "input-primary"
									}`}
									bind:value={previewEnd}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.description
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.description
								? error.description
								: ""}
						>
							<label class="input-group my-2">
								<span class="w-1/4 min-w-[64px]">
									{$t("common.description")}{$t("studio.submission.optional")}
								</span>
								<textarea
									class={`textarea ${
										(!description && dataIncomplete) ||
										(status === Status.ERROR && error?.description)
											? "textarea-error"
											: "textarea-primary"
									} w-3/4 h-28`}
									placeholder={$t("common.description")}{$t("studio.submission.optional")}
									bind:value={description}
								/>
							</label>
						</div>
						<div
							class={status === Status.ERROR && error?.chapters
								? "tooltip tooltip-open tooltip-right tooltip-error"
								: ""}
							data-tip={status === Status.ERROR && error?.chapters
								? error.chapters
								: ""}
						>
							<label class="input-group my-2" on:pointerenter={getChapters}>
								<span class="w-1/4 min-w-[64px]"
									>{$t("studio.submission.chapters")}{$t("studio.submission.optional")}</span
								>
								<select
									class={`select select-bordered w-3/4 min-w-[180px] ${
										status === Status.ERROR && error?.chapters
											? "select-error"
											: "select-primary"
									}`}
									bind:value={chapters}
								>
									{#if chapterList}
										{#each chapterList as chapter}
											<option value={chapter.id}
												>{chapter.title} - {chapter.subtitle}</option
											>
										{/each}
									{/if}
								</select>
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
				data-tip={$t(`recorder.${errorMsg}`)}
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
</style>
