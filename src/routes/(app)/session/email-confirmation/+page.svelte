<script lang="ts">
	import { goto } from "$app/navigation";
	import { browser } from "$app/environment";
	import * as api from "$lib/api";
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import { onMount } from "svelte";
	import { page } from "$app/stores";

	export let data: import("./$types").PageData;
	$: ({ status, msg, code } = data);

	let input = "",
		redirect = $page.url.searchParams.get("redirect");

	onMount(() => {
		if (code) {
			input = code;
		}
		if (status === Status.OK && browser) {
			goto(redirect ? redirect : "/session/login");
		}
	});

	const handleClick = async () => {
		status = Status.SENDING;
		let code = input;
		if (code?.length != 6) {
			return;
		}
		const resp = await api.auth.activate({ code });
		if (resp.ok) {
			goto(redirect ? redirect : "/session/login");
		} else {
			status = Status.ERROR;
			msg = (await resp.json()).detail;
		}
	};
</script>

<svelte:head>
	<title
		>{$t("session.email_confirmation.email_confirmation")} | {$t(
			"common.title"
		)}</title
	>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content text-center">
		<div class="max-w-4xl">
			<h1 class="text-5xl font-bold">
				{$t("session.email_confirmation.email_confirmation")}
			</h1>
			<p class="py-6">
				{$t("session.email_confirmation.email_confirmation_text")}
			</p>
			<input
				type="text"
				class={`input input-bordered input-lg ${
					status === Status.ERROR
						? "input-error"
						: input?.length == 6
						? "input-success"
						: "input-info"
				} w-full max-w-xs text-center glass`}
				placeholder={$t("session.email_confirmation.code")}
				bind:value={input}
				on:input={() => {
					status = Status.WAITING;
					if (!/^\d+$/.test(input) || input?.length > 6) {
						status = Status.ERROR;
						msg = "code_not_numeric";
					}
					if (input?.length == 0) {
						status = Status.WAITING;
					}
				}}
			/>
			<div class="mt-6">
				{#if status === Status.ERROR}
					<div
						class="tooltip tooltip-open tooltip-bottom tooltip-error"
						data-tip={msg}
					>
						<button class="btn btn-error">{$t("common.error")}</button>
					</div>
				{:else if status === Status.SENDING}
					<button class={`btn btn-outline btn-ghost btn-disabled glass`}
						>{$t("common.waiting")}</button
					>
				{:else}
					<button
						class={`btn btn-outline btn-accent ${
							input?.length == 6 ? "" : "btn-disabled"
						} glass`}
						on:click={handleClick}
						>{$t("session.email_confirmation.activate")}</button
					>
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>
