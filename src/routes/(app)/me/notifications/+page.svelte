<script lang="ts">
	import { Status } from "$lib/constants";
	import { t } from "$lib/translations/config";
	import Notification from "$lib/components/notification.svelte";
	import Pagination from "$lib/components/pagination.svelte";
	import { onMount } from "svelte";
	export let data: import("./$types").PageData;
	$: ({ status, content, error, access_token, user } = data);

	let page = 1,
    pageStatus = Status.RETRIEVING,
		notifications: any[] | null,
		notificationCount: number,
		previousNotifications: string,
		nextNotifications: string;

	onMount(() => {
		pageStatus = status;
		if (status === Status.OK) {
			notifications = content.results;
			notificationCount = content.count;
			previousNotifications = content.previous;
			nextNotifications = content.next;
		}
	});
</script>

<svelte:head>
	<title>{$t("notification.notifications")} | {$t("common.title")}</title>
</svelte:head>

<div class="bg-base-200 page">
	<div class="pt-32 flex justify-center">
		<div class="w-3/4 max-w-7xl min-w-20">
			<h1 class="text-4xl font-bold mb-6">
				{$t("notification.notifications")}
			</h1>
			<div class="py-4 min-w-fit">
				{#if pageStatus === Status.OK && notifications && notifications.length > 0}
					{#each notifications as notification}
						<Notification {notification} />
					{/each}
					<Pagination
						bind:previous={previousNotifications}
						bind:next={nextNotifications}
						bind:results={notifications}
						bind:count={notificationCount}
						bind:page
						bind:status={pageStatus}
						token={access_token}
						{user}
					/>
				{:else}
					<p class="pt-3 text-center">{$t("common.empty")}</p>
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
