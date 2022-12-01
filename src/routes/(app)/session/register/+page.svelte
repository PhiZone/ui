<script lang="ts">
	import { POST } from "$lib/utils";
	import { locale, locales, t } from "$lib/translations/config";
	import { goto } from "$app/navigation";
	import { Status } from "$lib/constants";

	let username = "";
	let email = "";
	let password = "";
	let confirm_password = "";
	let email_err = "";
	let username_err = "";
	let password_err = "";
	let error_msg = "";

	let status = Status.OK;

	const register = async () => {
		if (!username || !email || !password || !confirm_password) {
			error_msg = $t("session.data_incomplete");
			return;
		}
		if (password != confirm_password) {
			error_msg = $t("session.registration.passwords_differ");
		}
		status = Status.WAITING;
		const resp = await POST("/auth/register", {
			username,
			email,
			password,
			language: locale.get(),
		});
		if (resp.ok) {
			goto("/session/email-confirmation");
		} else {
			status = Status.OK;
			const errors = (await resp.json()).msg;
			console.log(errors);
			if (errors.email) {
				email_err = $t(`session.registration.${errors.email[0]}`);
			}
			if (errors.username) {
				username_err = $t(`session.registration.${errors.username[0]}`);
			}
			if (errors.password) {
				password_err = $t(`session.registration.${errors.password[0]}`);
			}
			error_msg = $t("session.registration.correct_errors");
		}
	};
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content flex-col lg:flex-row-reverse">
		<div class="text text-center lg:text-left">
			<h1 class="text-5xl font-bold">
				{$t("session.registration.register")}
			</h1>
			<p class="py-6">
				{$t("session.registration.registration_text")}
			</p>
		</div>
		<div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
			<div class="card-body">
				<div
					class="form-control"
					on:focusin={() => {
						status = Status.OK;
					}}
				>
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.username")}</span>
					</label>

					<input
						type="username"
						placeholder={$t("session.username")}
						class="input input-bordered"
						on:input={() => {
							error_msg = "";
							username_err = "";
						}}
						bind:value={username}
					/>
					<div
						class={username_err
							? "tooltip tooltip-open tooltip-bottom tooltip-error"
							: ""}
						data-tip={username_err ? username_err : null}
					/>
				</div>
				<div class="form-control">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.email")}</span>
					</label>
					<input
						type="email"
						placeholder={$t("session.email")}
						class="input input-bordered"
						on:input={() => {
							error_msg = "";
							email_err = "";
						}}
						bind:value={email}
					/>
					<div
						class={email_err
							? "tooltip tooltip-open tooltip-bottom tooltip-error"
							: ""}
						data-tip={email_err ? email_err : null}
					/>
				</div>
				<div class="form-control">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text">{$t("session.password")}</span>
					</label>
					<input
						type="password"
						placeholder={$t("session.password")}
						class="input input-bordered"
						on:input={() => {
							error_msg = "";
							password_err = "";
						}}
						bind:value={password}
					/>
					<div
						class={password_err
							? "tooltip tooltip-open tooltip-bottom tooltip-error"
							: ""}
						data-tip={password_err ? password_err : null}
					/>
				</div>
				<div class="form-control">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text"
							>{$t("session.registration.confirm_password")}</span
						>
					</label>
					<input
						type="password"
						placeholder={$t("session.registration.confirm_password")}
						class="input input-bordered"
						on:input={() => {
							error_msg = "";
						}}
						bind:value={confirm_password}
					/>
				</div>
				<div class="form-control">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label class="label">
						<span class="label-text"
							>{$t("session.registration.select_language")}</span
						>
					</label>
					<select
						class="select select-bordered w-full max-w-xs"
						bind:value={$locale}
					>
						{#each $locales as value}
							<option {value}>{$t(`lang.${value}`)}</option>
						{/each}
					</select>
				</div>
				<div class="form-control mt-6">
					{#if error_msg}
						<div
							class="tooltip tooltip-open tooltip-error"
							data-tip={error_msg}
						>
							<button class="btn btn-error">{$t("common.error")}</button>
						</div>
					{:else if status == Status.WAITING}
						<button class={`btn btn-outline btn-ghost btn-disabled glass`}
							>{$t("common.waiting")}</button
						>
					{:else}
						<button
							class="btn btn-accent btn-outline glass"
							on:click={register}
						>
							{$t("session.registration.register")}</button
						>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", sans-serif;
	}

	.text {
		padding-left: 40px;
	}
</style>
