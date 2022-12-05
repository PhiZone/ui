<script lang="ts">
	import type { User } from "$lib/models";
	import { t } from "$lib/translations/config";
	import { parseDateTime } from "$lib/utils";

	export let id: number,
		name: string,
		illustration: string,
		level: string,
		difficulty: string,
		status: number,
		showUser: boolean,
		user: User,
		replier: User,
		requested_at: string,
		replied_at: string;
</script>

<a href={`/recorder/requests/${id}`}>
	<div
		class="card m-4 min-w-[900px] h-44 card-side bg-base-100 shadow-xl glass overflow-hidden"
	>
		<figure class="min-w-[40%] max-w-[40%] h-44">
			<img
				class="object-cover w-full h-full"
				src={illustration}
				alt="Illustration"
			/>
		</figure>
		<div class="card-body w-[60%]">
			<h2 class="card-title text-2xl mb-3 min-w-fit">
				{name}
				<div class="ml-2 badge badge-lg badge-primary min-w-fit h-10 text-2xl">
					{level}
					{difficulty}
				</div>
			</h2>
			<div class="flex items-center min-w-fit">
				{#if showUser}
					<p class="min-w-fit">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("recorder.requester")}</span
						>
						{user.username}
					</p>
				{/if}
				<p class="min-w-fit">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("recorder.status")}</span
					>
					{$t(`recorder.status_${status}`)}
				</p>
				{#if replier}
					<p class="min-w-fit">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("recorder.replier")}</span
						>
						{replier.username}
					</p>
				{/if}
			</div>
			<div class="flex items-center min-w-fit">
				<p class="min-w-fit">
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("recorder.requested_at")}</span
					>
					{parseDateTime(requested_at)}
				</p>
				{#if replied_at}
					<p class="min-w-fit">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("recorder.replied_at")}</span
						>
						{parseDateTime(replied_at)}
					</p>
				{/if}
			</div>
		</div>
	</div>
</a>
