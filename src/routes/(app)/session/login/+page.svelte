<script>
	import { POST } from "$lib/utils";
	import { locale, t } from "$lib/translations/config";
	import { Status } from "$lib/constants";

	/** @type {import('./$types').PageData} */
	export let data;
	$: ({ redirect } = data);

	let email = "";
	let password = "";
	let error_msg = "";

	let status = Status.WAITING;

	const login = async () => {
		if (!email || !password) {
			error_msg = $t("session.data_incomplete");
			return;
		}
		status = Status.SENDING;
		const resp = await POST("/auth/login", { email, password }, locale.get());
		if (resp.ok) {
			location.href = redirect ? redirect : "/";
		} else {
			status = Status.ERROR;
			error_msg = $t(
				resp.status == 400
					? "session.login.invalid_credentials"
					: "common.unknown_error"
			);
		}
	};
</script>

<svelte:head>
	<title>{$t("session.login.login")} | {$t("common.title")}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content form-control lg:flex-row-reverse">
		<div class="px-10 text-center lg:text-left">
			<h1 class="text-5xl font-bold">
				{$t("session.login.login")}
			</h1>
			<p class="py-6">
				{$t("session.login.login_text")}
			</p>
		</div>
		<div class="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
			<div class="card-body">
				<form>
					<div class="form-control">
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label">
							<span class="label-text">{$t("session.email")}</span>
						</label>
						<input
							type="email"
							placeholder={$t("session.email")}
							autocomplete="username"
							class="input input-bordered"
							on:input={() => {
								error_msg = "";
							}}
							bind:value={email}
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
							autocomplete="current-password"
							class="input input-bordered"
							on:input={() => {
								error_msg = "";
							}}
							bind:value={password}
						/>
						<!-- svelte-ignore a11y-label-has-associated-control -->
						<label class="label flex justify-between">
							<a
								data-sveltekit-preload-data
								href="/session/password-reset"
								class="label-text-alt link link-hover"
							>
								{$t("session.login.forgot_password")}</a
							>
							<a
								data-sveltekit-preload-data
								href="/session/register"
								class="label-text-alt link link-hover"
							>
								{$t("session.registration.register")}</a
							>
						</label>
					</div>
					<div class="form-control mt-6">
						{#if error_msg}
							<div
								class="tooltip tooltip-open tooltip-error"
								data-tip={error_msg}
							>
								<button class="btn btn-error">{$t("common.error")}</button>
							</div>
						{:else if status === Status.SENDING}
							<button class={`btn btn-outline btn-ghost btn-disabled glass`}
								>{$t("common.waiting")}</button
							>
						{:else}
							<button class="btn btn-primary" on:click={login}>
								{$t("session.login.login")}</button
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
