<script lang="ts">
	import { goto } from "$app/navigation";
	import { t } from "$lib/translations/config";
	import { getUserPrivilege } from "$lib/utils";
	import { onMount } from "svelte";

	export let data: import("./$types").LayoutData;
	$: ({ access_token, user } = data);
	onMount(() => {
		if (!access_token) {
			goto(
				`/session/login?redirect=${encodeURIComponent(
					window.location.pathname + window.location.search
				)}`
			);
		}
		if (getUserPrivilege(user.type) < 2) {
			goto("/");
		}
	});
</script>

<div class="drawer drawer-mobile">
	<input id="studio-sidebar" type="checkbox" class="drawer-toggle" />
	<div class="drawer-content">
		<slot />
	</div>
	<div class="pt-[72px] drawer-side border-r">
		<label for="studio-sidebar" class="drawer-overlay" />
		<ul class="menu p-4 min-w-fit w-72 bg-base-100 text-base-content">
			<li><a data-sveltekit-preload-data href="/studio">{$t("studio.homepage")}</a></li>
			<li><a data-sveltekit-preload-data href="/studio/song-submissions">{$t("studio.song_submissions")}</a></li>
			<li><a data-sveltekit-preload-data href="/studio/chart-submissions">{$t("studio.chart_submissions")}</a></li>
			<li><a data-sveltekit-preload-data href="/studio/collaborations">{$t("studio.collaborations")}</a></li>
			<!-- <li><a data-sveltekit-preload-data href="/studio/admissions">{$t("studio.admissions")}</a></li> -->
		</ul>
	</div>
</div>

<style>
	* {
		font-family: "Saira", "Noto Sans SC", sans-serif;
	}
</style>