<script lang="ts">
	import type { Notification } from "$lib/models";
	import { t } from "$lib/translations/config";
	import { parseDateTime, parseRichText } from "$lib/utils";

	export let notification: Notification;

	const types = new Map([
		["User", "/users"],
		["Song", "/songs"],
		["Chart", "/charts"],
		["Comment", "/comments"],
		["Reply", "/replies"],
		["ChartUpload", "/studio/chart-submissions"],
		["Collab", "/studio/collaborations"],
	]);
</script>

<div class="indicator w-full my-4">
	<span
		class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
		>{$t(`notification.type_${notification.type}`)}</span
	>
	<div
		class={`card w-full min-w-fit h-fit card-side bg-base-100 shadow-lg overflow-hidden ${
			notification.read_at
				? Math.abs(
						new Date().getTime() - new Date(notification.read_at).getTime()
				  ) < 2000
					? "border border-secondary"
					: "border"
				: "border border-secondary"
		}`}
	>
		<div class="card-body w-[60%]">
			<h2 class="card-title text-2xl mb-3 min-w-fit inline">
				{#each parseRichText(notification.message) as t}
					{#if t.type}
						<a
							href={`${types.get(t.type)}/${t.id}`}
							class="text-accent hover:underline"
							target="_blank"
							rel="noreferrer">{t.text}</a
						>
					{:else}
						{t.text}
					{/if}
				{/each}
			</h2>
			<div class="flex items-center min-w-fit">
				<p class="min-w-fit">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("notification.notified_at")}</span
					>
					{parseDateTime(notification.notified_at)}
				</p>
				{#if notification.read_at}
					<p class="min-w-fit">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("notification.read_at")}</span
						>
						{parseDateTime(notification.read_at)}
					</p>
				{/if}
			</div>
		</div>
	</div>
</div>
