<script lang="ts">
	import { t } from "$lib/translations/config";
	import { getUserPrivilege } from "$lib/utils";

	export let data: import("./$types").PageData;
	$: ({ user } = data);
</script>

<div class="hero min-h-screen bg-base-200">
	<div class="hero-content">
		<div class="w-5/6 text-center">
			<h3 class="text-4xl font-bold">RPE Recorder</h3>
			<h1 class="text-6xl font-bold">{$t("recorder.recorder")}</h1>
			<p class="text-lg py-6 text-left whitespace-pre-wrap">
				{$t("recorder.description")}
			</p>
			{#if user}
				<a href="recorder/requests/new"
					><button
						class="btn btn-secondary text-lg btn-xl btn-outline glass mr-3"
						>{$t("recorder.new_request")}</button
					></a
				>
				<a href="recorder/requests"
					><button class="btn btn-accent text-lg btn-xl btn-outline glass ml-3"
						>{getUserPrivilege(user.type) < 3
							? $t("recorder.view_history")
							: $t("recorder.manage")}</button
					></a
				>
			{:else}
				<p class="text-error">{$t("common.session_required")}</p>
			{/if}
		</div>
	</div>
</div>

<style>
	* {
		font-family: "Saira", sans-serif;
	}
</style>
