<script lang="ts">
	import { t } from "$lib/translations/config";
	import * as api from "$lib/api";
	import { ContentType, Status } from "$lib/constants";
	import { goto } from "$app/navigation";
	import type { Chapter, SongSubmissionError } from "$lib/models";
	import { onMount } from "svelte";

	export let data: import("./$types").PageData;
	$: ({ content, access_token, user } = data);

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
		emptyDescription = false,
		chapters: Chapter[] = [],
		showChapters = false,
		newChapter: number = 0,
		song: File | null = null,
		illustration: File | null = null,
		status = Status.OK,
		error: SongSubmissionError,
		chapterList: Chapter[];

	onMount(() => {
		if (content && typeof content.chapters === "object") {
			chapters = content.chapters;
			showChapters = chapters.length > 0;
		}
	});

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

	const getChapterString = (chapters: Chapter[]) => {
		let ids: number[] = [];
		chapters.forEach((value) => {
			ids.push(value.id);
		});
		return ids.join(",");
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

	async function handleSubmit() {
		let formData = new FormData();
		if (songName) formData.append("name", songName);
		if (song) formData.append("song", song as unknown as File);
		if (illustration)
			formData.append("illustration", illustration as unknown as File);
		if (edition) formData.append("edition", edition);
		if (composer) formData.append("composer", composer);
		if (illustrator) formData.append("illustrator", illustrator);
		if (bpm) formData.append("bpm", bpm);
		if (offset) formData.append("offset", offset);
		if (previewStart) formData.append("preview_start", `00:${previewStart}`);
		if (previewEnd) formData.append("preview_end", `00:${previewEnd}`);
		if (emptyDescription || description)
			formData.append("description", description);
		formData.append("chapters", getChapterString(chapters));
		status = Status.SENDING;
		const resp = await api.PATCH(
			`/song_uploads/${content?.id}/`,
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
	<title>
		{$t("studio.song_submission")} - {content?.name} - {$t("common.edit")} | {$t(
			"common.title"
		)}
	</title>
</svelte:head>

{#if content !== null}
	<div class="bg-base-200 min-h-screen">
		<div class="pt-32 flex justify-center">
			<div class="w-3/4 max-w-6xl min-w-20">
				<h1 class="text-4xl font-bold mb-6">
					{$t("studio.song_submission")} - {$t("common.edit")}
				</h1>
				<div class="card w-full bg-base-100 shadow-lg">
					<div class="card-body">
						<div
							class="form-control"
							on:focusin={() => {
								status = Status.OK;
							}}
						>
							<div class="flex justify-start items-center my-2">
								<span class="w-32 px-4 place-self-center"
									>{$t("studio.submission.original_audio")}</span
								>
								<a
									href={content.song}
									target="_blank"
									rel="noreferrer"
									class="hover:underline place-self-center min-w-fit mr-4"
									download
								>
									{$t("common.download")}
								</a>
							</div>
							<div class="flex">
								<span class="w-32 px-4 place-self-center"
									>{$t("common.form.audio")}</span
								>
								<input
									type="file"
									accept=".mp3, .ogg, .oga"
									class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
										status === Status.ERROR && error?.song
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
							<div class="flex justify-start items-center my-2">
								<span class="w-32 px-4 place-self-center"
									>{$t("studio.submission.original_illustration")}</span
								>
								<a
									href={content.illustration}
									target="_blank"
									rel="noreferrer"
									class="hover:underline place-self-center min-w-fit mr-4"
									download
								>
									{$t("common.download")}
								</a>
							</div>
							<div class="flex">
								<span class="w-32 px-4 place-self-center"
									>{$t("common.form.illustration")}</span
								>
								<input
									type="file"
									accept=".jpg, .jpeg, .png"
									class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
										status === Status.ERROR && error?.illustration
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
										placeholder={content.name}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.name
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
										placeholder={content.edition}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.edition
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
										placeholder={content.composer}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.composer
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
										placeholder={content.illustrator}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.illustrator
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
								data-tip={status === Status.ERROR && error?.bpm
									? error.bpm
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]">{$t("song.bpm")}</span>
									<input
										type="text"
										placeholder={content.bpm}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.bpm
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
										placeholder={`${content.offset}ms`}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.offset
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
									? error.preview_start[0].replace(
											"hh:mm[:ss[.uuuuuu]]",
											"mm:ss"
									  )
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]"
										>{$t("studio.submission.preview_start")}</span
									>
									<input
										type="text"
										placeholder={content.preview_start.replace(/^00:/, "")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.preview_start
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
										placeholder={content.preview_end.replace(/^00:/, "")}
										class={`input input-bordered w-3/4 min-w-[180px] ${
											status === Status.ERROR && error?.preview_end
												? "input-error"
												: "input-primary"
										}`}
										bind:value={previewEnd}
									/>
								</label>
							</div>
							<div
								class={status === Status.ERROR && error?.description
									? "tooltip tooltip-open tooltip-right tooltip-error relative"
									: "relative"}
								data-tip={status === Status.ERROR && error?.description
									? error.description
									: ""}
							>
								<label class="input-group my-2">
									<span class="w-1/4 min-w-[64px]">
										{$t("common.description")}
									</span>
									<textarea
										class={`textarea ${
											status === Status.ERROR && error?.description
												? "textarea-error"
												: "textarea-primary"
										} w-3/4 h-28`}
										placeholder={!emptyDescription ? content.description : ""}
										bind:value={description}
										on:input={() => {
											emptyDescription = false;
										}}
									/>
								</label>
								<button
									class="absolute right-0 top-2 btn btn-accent btn-outline btn-sm"
									on:click={() => {
										emptyDescription = true;
										description = "";
									}}>{$t("common.empty_v")}</button
								>
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
										>{$t("studio.submission.chapters")}</span
									>
									<select
										class={`select select-bordered w-2/3 min-w-[180px] ${
											status === Status.ERROR && error?.chapters
												? "select-error"
												: "select-primary"
										}`}
										bind:value={newChapter}
									>
										{#if chapterList}
											{#each chapterList as chapter, i}
												<option value={i}
													>{chapter.title} - {chapter.subtitle}</option
												>
											{/each}
										{/if}
									</select>
									<button
										class="btn btn-primary btn-outline text-xl w-1/12"
										on:click={() => {
											let perform = true;
											chapters.forEach((value) => {
												if (value.id === chapterList[newChapter].id) {
													perform = false;
													return;
												}
											});
											if (perform) {
												showChapters = false;
												chapters.push(chapterList[newChapter]);
												setTimeout(() => {
													showChapters = true;
												}, 1);
											}
										}}>+</button
									>
								</label>
								{#if showChapters}
									<div class="flex h-fit">
										<span class="w-32 px-4 place-self-center"
											>{$t("studio.submission.chapters")}</span
										>
										<div class="form-control w-full gap-1">
											{#each chapters as chapter, i}
												{#if chapter}
													<div class="flex items-center justify-between">
														<a
															href={`/chapters/${chapter.id}`}
															target="_blank"
															rel="noreferrer"
															class="hover:underline"
														>
															{chapter.title} - {chapter.subtitle}
														</a>
														<button
															class="btn btn-accent btn-outline btn-sm text-xl"
															on:click={() => {
																showChapters = false;
																chapters.splice(i, 1);
																setTimeout(() => {
																	showChapters = chapters.length > 0;
																}, 1);
															}}>-</button
														>
													</div>
												{/if}
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
				<button
					class={`btn btn-outline ${
						status === Status.ERROR
							? "btn-disabled tooltip tooltip-open tooltip-left tooltip-error"
							: status === Status.SENDING
							? "btn btn-ghost btn-disabled glass"
							: "btn-primary"
					} glass float-right my-5 text-lg`}
					data-tip={$t(`common.form.errors.${errorMsg}`)}
					on:click={handleSubmit}
					>{$t(
						status === Status.SENDING ? "common.waiting" : "common.submit"
					)}</button
				>
			</div>
		</div>
	</div>
{/if}

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
