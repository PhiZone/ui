<script lang="ts">
	import { goto } from "$app/navigation";
	import * as api from "$lib/api";
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";

	export let data: import("./$types").PageData;
	$: ({ status, msg, token } = data);

	let password = "",
		confirmPassword = "",
		emailErr = "",
		email = "";

	const requestToken = async () => {
		if (!email) {
			msg = $t("session.data_incomplete");
			return;
		}
		status = Status.RETRIEVING;
		const resp = await api.POST("/password_reset/", { email });
		if (resp.ok) {
			status = Status.OK;
		} else {
			status = Status.ERROR;
			const json = await resp.json();
			console.log(json);
			if (json.email) {
				emailErr = json.email[0];
			}
			msg = $t("common.correct_errors");
		}
	};

	const resetPassword = async () => {
		if (!password || !confirmPassword) {
			msg = $t("session.data_incomplete");
			status = Status.ERROR;
			return;
		}
		if (password != confirmPassword) {
			msg = $t("session.passwords_differ");
			status = Status.ERROR;
			return;
		}
		status = Status.SENDING;
		const resp = await api.POST("/password_reset/confirm/", {
			token,
			password,
		});
		if (resp.ok) {
			goto("/session/login");
		} else {
			status = Status.ERROR;
			msg = (await resp.json()).error;
		}
	};
</script>

<svelte:head>
	<title
		>{$t("session.password_reset.password_reset")} | {$t("common.title")}</title
	>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="w-[400px] max-w-7xl">
			<h1 class="text-5xl font-bold">
				{$t("session.password_reset.password_reset")}
			</h1>
			{#if !token}
				{#if status != Status.OK}
					<p class="py-6">
						{$t("session.password_reset.password_reset_text1")}
					</p>
					<div
						class={emailErr
							? "tooltip tooltip-open tooltip-right tooltip-error"
							: ""}
						data-tip={emailErr ? emailErr : null}
					>
						<input
							type="email"
							placeholder={$t("session.email")}
							class={`input input-bordered input-lg ${
								status === Status.ERROR ? "input-error" : "input-info"
							} w-full max-w-xs text-center glass`}
							on:input={() => {
								msg = "";
								emailErr = "";
								status = Status.WAITING;
							}}
							bind:value={email}
						/>
					</div>
					<div class="mt-6">
						{#if status === Status.ERROR}
							<div
								class="tooltip tooltip-open tooltip-bottom tooltip-error"
								data-tip={msg}
							>
								<button class="btn btn-error">{$t("common.error")}</button>
							</div>
						{:else if status === Status.SENDING}
							<button class={`btn btn-ghost btn-disabled glass`}
								>{$t("common.waiting")}</button
							>
						{:else}
							<button
								class={`btn btn-outline btn-accent ${
									email?.length > 0 ? "" : "btn-disabled"
								} glass`}
								on:click={requestToken}>{$t("common.submit")}</button
							>
						{/if}
					</div>
				{:else}
					<p class="py-6">
						{$t("session.password_reset.password_reset_text2")}
					</p>
				{/if}
			{:else}
				<p class="py-6">
					{$t("session.password_reset.password_reset_text3")}
				</p>
				<form>
					<input type="email" autocomplete="username" class="hidden" />
					<input
						type="password"
						autocomplete="new-password"
						class={`input input-bordered input-lg my-2 ${
							status === Status.ERROR
								? "input-error"
								: confirmPassword && password == confirmPassword
								? "input-success"
								: "input-info"
						} w-full max-w-xs text-center glass`}
						placeholder={$t("session.password_reset.new_password")}
						bind:value={password}
						on:input={() => {
							status = Status.WAITING;
							msg = "";
						}}
					/>
					<input
						type="password"
						autocomplete="new-password"
						class={`input input-bordered input-lg my-2 ${
							status === Status.ERROR
								? "input-error"
								: password && password == confirmPassword
								? "input-success"
								: "input-info"
						} w-full max-w-xs text-center glass`}
						placeholder={$t("session.confirm_password")}
						bind:value={confirmPassword}
						on:input={() => {
							status = Status.WAITING;
							msg = "";
						}}
					/>
				</form>
				<div class="mt-6">
					{#if status === Status.ERROR}
						<div
							class="tooltip tooltip-open tooltip-bottom tooltip-error"
							data-tip={msg}
						>
							<button class="btn btn-error">{$t("common.error")}</button>
						</div>
					{:else if status === Status.RETRIEVING}
						<button class={`btn btn-ghost btn-disabled glass`}
							>{$t("common.waiting")}</button
						>
					{:else}
						<button
							class={`btn btn-outline btn-accent ${
								password?.length > 0 ? "" : "btn-disabled"
							} glass`}
							on:click={resetPassword}>{$t("common.submit")}</button
						>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
