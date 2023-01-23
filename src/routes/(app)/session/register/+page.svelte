<script lang="ts">
	import { POST } from "$lib/utils";
	import { locale, locales, t } from "$lib/translations/config";
	import { Status } from "$lib/constants";
	import { page } from "$app/stores";
	import { goto } from "$app/navigation";

	let username = "";
	let email = "";
	let password = "";
	let confirmPassword = "";
	let emailErr = "";
	let usernameErr = "";
	let passwordErr = "";
	let msg = "";
	let status = Status.WAITING;

	const register = async () => {
		if (!username || !email || !password || !confirmPassword) {
			msg = $t("session.data_incomplete");
			return;
		}
		if (password != confirmPassword) {
			msg = $t("session.passwords_differ");
			return;
		}
		status = Status.SENDING;
		const resp = await POST(
			"/auth/register",
			{
				username,
				email,
				password,
				language: locale.get(),
				search: $page.url.search,
			},
			locale.get()
		);
		const json = await resp.json();
		if (json.code === 200) {
			status = Status.OK;
			goto(`/session/email-confirmation${$page.url.search}`);
		} else {
			status = Status.ERROR;
			const error = json.content;
			console.log(error);
			if (error.email) {
				emailErr = error.email[0];
			}
			if (error.username) {
				usernameErr = error.username[0];
			}
			if (error.password) {
				passwordErr = error.password[0];
			}
			if (error.language) {
				msg = $t("session.registration.language_error");
			} else if (error.detail) {
				msg = error.detail;
			} else {
				msg = $t("common.correct_errors");
			}
		}
	};
</script>

<svelte:head>
	<title>{$t("session.registration.register")} | {$t("common.title")}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content form-control lg:flex-row-reverse">
		<div class="px-10 text-center lg:text-left">
			<h1 class="text-5xl font-bold">
				{$t("session.registration.register")}
			</h1>
			<p class="py-6">
				{$t("session.registration.registration_text")}
			</p>
		</div>
		<div class="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
			<div class="card-body">
				<form
					class="w-full form-control"
					on:focusin={() => {
						status = Status.WAITING;
					}}
				>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.username")}</span>
					</label>
					<input
						name="username"
						type="username"
						placeholder={$t("session.username")}
						class="input input-bordered"
						on:input={() => {
							msg = "";
							usernameErr = "";
						}}
						bind:value={username}
					/>
					<div
						class={usernameErr
							? "tooltip tooltip-open tooltip-bottom tooltip-error"
							: ""}
						data-tip={usernameErr ? usernameErr : null}
					/>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.email")}</span>
					</label>
					<input
						name="email"
						type="email"
						placeholder={$t("session.email")}
						autocomplete="username"
						class="input input-bordered"
						on:input={() => {
							msg = "";
							emailErr = "";
						}}
						bind:value={email}
					/>
					<div
						class={emailErr
							? "tooltip tooltip-open tooltip-bottom tooltip-error"
							: ""}
						data-tip={emailErr ? emailErr : null}
					/>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.password")}</span>
					</label>
					<input
						name="password"
						type="password"
						placeholder={$t("session.password")}
						autocomplete="new-password"
						class="input input-bordered"
						on:input={() => {
							msg = "";
							passwordErr = "";
						}}
						bind:value={password}
					/>
					<div
						class={passwordErr
							? "tooltip tooltip-open tooltip-bottom tooltip-error"
							: ""}
						data-tip={passwordErr ? passwordErr : null}
					/>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.confirm_password")}</span>
					</label>
					<input
						name="confirm_password"
						type="password"
						placeholder={$t("session.confirm_password")}
						autocomplete="new-password"
						class="input input-bordered"
						on:input={() => {
							msg = "";
						}}
						bind:value={confirmPassword}
					/>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text"
							>{$t("session.registration.select_language")}</span
						>
					</label>
					<select
						name="language"
						class="select select-bordered w-full max-w-xs"
						bind:value={$locale}
					>
						{#each $locales as value}
							<option {value}>{$t(`lang.${value}`)}</option>
						{/each}
					</select>
					<div class="w-full flex justify-center mt-6">
						{#if msg}
							<div
								class="tooltip tooltip-open tooltip-bottom tooltip-error w-full"
								data-tip={msg}
							>
								<button class="btn btn-error w-full"
									>{$t("common.error")}</button
								>
							</div>
						{:else if status === Status.SENDING}
							<button class="btn btn-ghost btn-disabled glass w-full"
								>{$t("common.waiting")}</button
							>
						{:else}
							<button
								class="btn btn-accent btn-outline glass w-full"
								on:click={register}
							>
								{$t("session.registration.register")}</button
							>
						{/if}
					</div>
				</form>
			</div>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
