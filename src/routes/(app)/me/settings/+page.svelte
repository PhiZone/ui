<script lang="ts">
	import { ContentType, Status } from "$lib/constants";
	import * as api from "$lib/api";
	import { locales, locale, t } from "$lib/translations/config";

	export let data: import("./$types").PageData;
	$: ({ access_token, user } = data);

	let avatar: File | null = null,
		avatarData: string | ArrayBuffer | null | undefined,
		avatarStatus = Status.OK,
		avatarErr: string[],
		username: string,
		usernameStatus = Status.OK,
		usernameErr: string[],
		gender: number | null = null,
		genderStatus = Status.OK,
		genderErr: string[],
		languageStatus = Status.OK,
		languageErr: string[],
		bio: string,
		bioStatus = Status.OK,
		bioErr: string[];

	const handleAvatar = (
		e: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		avatarStatus = Status.OK;
		if (avatarErr) avatarErr = [];
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			avatar = target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(avatar);
			reader.onload = () => {
				avatarData = reader.result;
			};
		}
	};

	const submitAvatar = async () => {
		if (!avatar) {
			avatarStatus = Status.ERROR;
			avatarErr = $t("common.input_null");
			return;
		}
		avatarStatus = Status.SENDING;
		let formData = new FormData();
		formData.append("avatar", avatar);
		const resp = await api.PATCH(
			`/users/${user.id}/`,
			formData,
			access_token,
			user,
			ContentType.FORM_DATA
		);
		if (resp.ok) {
			window.location.reload();
		} else {
			avatarErr = (await resp.json()).avatar;
			avatarStatus = Status.ERROR;
		}
	};

	const submitText = async (
		field: string,
		text: string | number | null,
		status: Status,
		textErr: string[],
		nullable = false
	) => {
		if (!nullable && !text) {
			return {
				status: Status.ERROR,
				textErr: [$t("common.input_null")],
			};
		}
		status = Status.SENDING;
		const resp = await api.PATCH(
			`/users/${user.id}/`,
			{ [field]: text ? text : "" },
			access_token,
			user
		);
		if (resp.ok) {
			window.location.reload();
		} else {
			textErr = (await resp.json())[field];
			status = Status.ERROR;
		}
		return {
			status,
			textErr,
		};
	};
</script>

<svelte:head>
	<title>{$t("common.settings")} | {$t("common.title")}</title>
</svelte:head>

<div class="bg-base-200 page">
	<div class="pt-32 pb-24 flex justify-center">
		<div class="mx-4 min-w-[890px] w-[60vw] max-w-[1150px]">
			<h1 class="text-4xl font-bold mb-6">
				{$t("common.settings")}
			</h1>
			<div class="indicator w-full my-4">
				<span
					class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
					>{$t("common.profile")}</span
				>
				<div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
					<div class="card-body py-10">
						<div class="avatar gap-4 items-center min-w-fit h-fit">
							<span class="w-16 min-w-fit px-4 place-self-center"
								>{$t("user.avatar")}</span
							>
							<div
								class={`mx-auto min-w-fit w-[140px] h-[140px] rounded-full m-2 overflow-hidden border-[4px] ${
									user.type == "admin"
										? "border-indigo-500"
										: user.type == "volunteer"
										? "border-emerald-500"
										: user.type == "qualified"
										? "border-sky-500"
										: "border-neutral-500"
								}`}
							>
								<img
									class="object-fill"
									src={avatarData ? avatarData : user.avatar}
									alt="Avatar"
								/>
							</div>
							<input
								type="file"
								accept=".jpg, .jpeg, .png, .webp"
								class={`mb-2 w-64 file:mr-2 file:py-2 file:border-0 file:btn ${
									avatarStatus === Status.ERROR && avatarErr
										? "input-error file:btn-error"
										: "input-primary file:btn-outline file:bg-primary"
								}`}
								on:change={handleAvatar}
							/>
							{#if avatarStatus === Status.ERROR && avatarErr}
								<span class="text-error">{avatarErr}</span>
							{:else}
								<span>{$t("common.form.tips.image")}</span>
							{/if}
							<button
								class={`btn btn-outline ${
									avatarStatus === Status.ERROR
										? "btn-error btn-disabled"
										: avatarStatus === Status.SENDING
										? "btn btn-ghost btn-disabled glass"
										: "btn-primary"
								} glass float-right my-5 text-lg`}
								on:click={submitAvatar}
								>{$t(
									avatarStatus === Status.SENDING
										? "common.waiting"
										: "common.submit"
								)}</button
							>
						</div>
						<div class="flex items-center justify-between">
							<span class="w-16 min-w-fit px-4 place-self-center"
								>{$t("user.gender")}</span
							>
							<div class="flex justify-between w-[60%]">
								<div class="w-1/3 flex items-center justify-start">
									{#if user.gender == 1}
										<span class="badge">
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
									{:else if user.gender == 2}
										<span class="badge">
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
								</div>
								<div class="flex gap-2 w-1/3">
									<input
										type="radio"
										bind:group={gender}
										name="gender"
										value="1"
										class={`radio ${
											genderStatus === Status.ERROR && genderErr
												? "radio-error"
												: genderStatus === Status.SENDING
												? "radio-disabled pointer-events-none"
												: "radio-primary"
										}`}
										on:input={() => {
											if (genderStatus === Status.ERROR) {
												genderStatus = Status.OK;
												genderErr = [];
											}
										}}
									/>
									<p>
										{$t("user.gender_1")}
									</p>
								</div>
								<div class="flex gap-2 w-1/3">
									<input
										type="radio"
										bind:group={gender}
										name="gender"
										value="2"
										class={`radio ${
											genderStatus === Status.ERROR && genderErr
												? "radio-error"
												: genderStatus === Status.SENDING
												? "radio-disabled pointer-events-none"
												: "radio-primary"
										}`}
										on:input={() => {
											if (genderStatus === Status.ERROR) {
												genderStatus = Status.OK;
												genderErr = [];
											}
										}}
									/>
									<p>
										{$t("user.gender_2")}
									</p>
								</div>
							</div>
							<div
								class={genderStatus === Status.ERROR && genderErr
									? "tooltip tooltip-open tooltip-left tooltip-error my-3"
									: "my-3"}
								data-tip={genderStatus === Status.ERROR && genderErr
									? genderErr
									: ""}
							>
								<button
									class={`btn btn-outline min-w-fit ${
										genderStatus === Status.ERROR
											? "btn-error btn-disabled"
											: genderStatus === Status.SENDING
											? "btn btn-ghost btn-disabled glass"
											: "btn-primary"
									} glass float-right text-lg`}
									on:click={async () => {
										let data = await submitText(
											"gender",
											gender,
											genderStatus,
											genderErr
										);
										if (data?.status) genderStatus = data?.status;
										if (data?.textErr) genderErr = data?.textErr;
									}}
									>{$t(
										genderStatus === Status.SENDING
											? "common.waiting"
											: "common.submit"
									)}</button
								>
							</div>
						</div>
						<div
							class={usernameStatus === Status.ERROR && usernameErr
								? "tooltip tooltip-open tooltip-bottom tooltip-error my-3"
								: "my-3"}
							data-tip={usernameStatus === Status.ERROR && usernameErr
								? usernameErr
								: ""}
						>
							<label class="input-group">
								<span class="w-[12%] min-w-fit">{$t("user.username")}</span>
								<input
									type="text"
									placeholder={user.username}
									class={`input w-[88%] min-w-[180px] ${
										usernameStatus === Status.ERROR && usernameErr
											? "input-error"
											: usernameStatus === Status.SENDING
											? "input-disabled pointer-events-none"
											: "input-primary"
									}`}
									on:input={() => {
										if (usernameStatus === Status.ERROR) {
											usernameStatus = Status.OK;
											usernameErr = [];
										}
									}}
									bind:value={username}
								/>
								<button
									class={`btn btn-outline ${
										usernameStatus === Status.ERROR
											? "btn-error btn-disabled"
											: usernameStatus === Status.SENDING
											? "btn btn-ghost btn-disabled glass"
											: "btn-primary"
									} glass float-right text-lg`}
									on:click={async () => {
										let data = await submitText(
											"username",
											username,
											usernameStatus,
											usernameErr
										);
										if (data?.status) usernameStatus = data?.status;
										if (data?.textErr) usernameErr = data?.textErr;
									}}
									>{$t(
										usernameStatus === Status.SENDING
											? "common.waiting"
											: "common.submit"
									)}</button
								>
							</label>
						</div>
						<div
							class={languageStatus === Status.ERROR && languageErr
								? "tooltip tooltip-open tooltip-bottom tooltip-error my-3"
								: "my-3"}
							data-tip={languageStatus === Status.ERROR && languageErr
								? languageErr
								: ""}
						>
							<label class="input-group">
								<span class="w-[12%] min-w-fit">{$t("user.language")}</span>
								<select
									bind:value={$locale}
									class={`select flex-shrink w-[88%] min-w-[180px] ${
										languageStatus === Status.ERROR && languageErr
											? "input-error"
											: languageStatus === Status.SENDING
											? "input-disabled pointer-events-none"
											: "input-primary"
									}`}
									on:input={() => {
										if (languageStatus === Status.ERROR) {
											languageStatus = Status.OK;
											languageErr = [];
										}
									}}
								>
									{#each $locales as value}
										<option {value}>{$t(`lang.${value}`)}</option>
									{/each}
								</select>
								<button
									class={`btn btn-outline ${
										languageStatus === Status.ERROR
											? "btn-error btn-disabled"
											: languageStatus === Status.SENDING
											? "btn btn-ghost btn-disabled glass"
											: "btn-primary"
									} glass float-right text-lg`}
									on:click={async () => {
										let data = await submitText(
											"language",
											locale.get(),
											languageStatus,
											languageErr
										);
										if (data?.status) languageStatus = data?.status;
										if (data?.textErr) languageErr = data?.textErr;
									}}
									>{$t(
										languageStatus === Status.SENDING
											? "common.waiting"
											: "common.submit"
									)}</button
								>
							</label>
						</div>
						<div
							class={bioStatus === Status.ERROR && bioErr
								? "tooltip tooltip-open tooltip-bottom tooltip-error my-3"
								: "my-3"}
							data-tip={bioStatus === Status.ERROR && bioErr ? bioErr : ""}
						>
							<label class="input-group">
								<span class="w-[12%] min-w-fit">{$t("user.bio")}</span>
								<textarea
									placeholder={user.bio}
									class={`textarea rounded-none w-[88%] min-w-[180px] h-48 ${
										bioStatus === Status.ERROR && bioErr
											? "textarea-error"
											: bioStatus === Status.SENDING
											? "textarea-disabled pointer-events-none"
											: "textarea-primary"
									}`}
									on:input={() => {
										if (bioStatus === Status.ERROR) {
											bioStatus = Status.OK;
											bioErr = [];
										}
									}}
									bind:value={bio}
								/>
								<button
									class={`btn btn-outline place-self-center ${
										bioStatus === Status.ERROR
											? "btn-error btn-disabled"
											: bioStatus === Status.SENDING
											? "btn btn-ghost btn-disabled glass"
											: "btn-primary"
									} glass float-right text-lg`}
									on:click={async () => {
										let data = await submitText(
											"bio",
											bio,
											bioStatus,
											bioErr,
											true
										);
										if (data?.status) bioStatus = data?.status;
										if (data?.textErr) bioErr = data?.textErr;
									}}
									>{$t(
										bioStatus === Status.SENDING
											? "common.waiting"
											: "common.submit"
									)}</button
								>
							</label>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
