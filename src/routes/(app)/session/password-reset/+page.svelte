<script lang="ts">
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
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
		status = Status.WAITING;
		const resp = await api.POST("password_reset/", { email });
		if (resp.ok) {
			status = Status.OK;
		} else {
			status = Status.ERROR;
			const json = await resp.json();
			console.log(json);
			if (json.email) {
				emailErr = $t(`session.password_reset.${json.email[0]}`);
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
		status = Status.WAITING;
		const resp = await api.POST("password_reset/confirm/", { token, password });
		if (resp.ok) {
			goto("/session/login?s=1");
		} else {
			status = Status.ERROR;
			msg = (await resp.json()).error;
		}
	};
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-4xl">
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
								status == Status.ERROR ? "input-error" : "input-info"
							} w-full max-w-xs text-center glass`}
							on:input={() => {
								msg = "";
								emailErr = "";
								status = Status.INPUT_REQUIRED;
							}}
							bind:value={email}
						/>
					</div>
					<div class="mt-6">
						{#if status == Status.ERROR}
							<div
								class="tooltip tooltip-open tooltip-bottom tooltip-error"
								data-tip={msg}
							>
								<button class="btn btn-error">{$t("common.error")}</button>
							</div>
						{:else if status == Status.WAITING}
							<button class={`btn btn-outline btn-ghost btn-disabled glass`}
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
				<input
					type="password"
					class={`input input-bordered input-lg my-2 ${
						status == Status.ERROR
							? "input-error"
							: confirmPassword && password == confirmPassword
							? "input-success"
							: "input-info"
					} w-full max-w-xs text-center glass`}
					placeholder={$t("session.password_reset.new_password")}
					bind:value={password}
					on:input={() => {
						status = Status.INPUT_REQUIRED;
						msg = "";
					}}
				/>
				<input
					type="password"
					class={`input input-bordered input-lg my-2 ${
						status == Status.ERROR
							? "input-error"
							: password && password == confirmPassword
							? "input-success"
							: "input-info"
					} w-full max-w-xs text-center glass`}
					placeholder={$t("session.confirm_password")}
					bind:value={confirmPassword}
					on:input={() => {
						status = Status.INPUT_REQUIRED;
						msg = "";
					}}
				/>
				<div class="mt-6">
					{#if status == Status.ERROR}
						<div
							class="tooltip tooltip-open tooltip-bottom tooltip-error"
							data-tip={msg}
						>
							<button class="btn btn-error">{$t("common.error")}</button>
						</div>
					{:else if status == Status.WAITING}
						<button class={`btn btn-outline btn-ghost btn-disabled glass`}
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
		font-family: "Saira", sans-serif;
	}
</style>
