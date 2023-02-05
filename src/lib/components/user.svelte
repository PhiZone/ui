<script lang="ts">
	import * as api from "$lib/api";
	import type { User } from "$lib/models";
	import { t } from "$lib/translations/config";
	import { getCompressedImage, getUserColor, getUserLevel } from "$lib/utils";

	export let user: User,
		operator: User,
		token: string | undefined,
		mini = false,
		fixedHeight = false,
		showButton = true;

	let fans = user.fans,
		isFollowing = user.is_following,
		error = "";

	const follow = async () => {
		isFollowing = true;
		fans++;
		const resp = await api.POST(
			"/relations/",
			{
				followee: user.id,
				operation: 0,
			},
			token,
			operator
		);
		if (!resp.ok) {
			const json = await resp.json();
			error = json.detail;
			console.log(json);
			isFollowing = false;
			fans--;
			setTimeout(() => {
				error = "";
			}, 3500);
		}
	};

	const unfollow = async () => {
		isFollowing = false;
		fans--;
		const resp = await api.POST(
			"/relations/",
			{
				followee: user.id,
				operation: 1,
			},
			token,
			operator
		);
		if (!resp.ok) {
			const json = await resp.json();
			error = json.detail;
			console.log(json);
			isFollowing = true;
			fans++;
			setTimeout(() => {
				error = "";
			}, 3500);
		}
	};
</script>

<div class={`card w-full shadow-lg bg-base-100 ${fixedHeight ? "h-60" : ""}`}>
	<div
		class={`card-body py-3 px-4 ${
			mini ? "flex-row gap-8 justify-between" : ""
		} items-center`}
	>
		<a data-sveltekit-preload-data href={`/users/${user.id}`}>
			<div class="avatar flex items-center min-w-fit">
				<div
					class={`w-12 rounded-full border-[3px] border-opacity-80 ${
						user.type == "admin"
							? "border-indigo-500"
							: user.type == "volunteer"
							? "border-emerald-500"
							: user.type == "qualified"
							? "border-sky-500"
							: "border-neutral-500"
					}`}
				>
					<img src={getCompressedImage(user.avatar)} alt="Avatar" />
				</div>
				<p
					class={`text-lg ml-2 text-[${getUserColor(
						user.type
					)}] flex gap-1 items-center`}
				>
					{user.username}
					<span class="badge badge-sm font-bold"
						>LV{getUserLevel(user.exp)}</span
					>
					{#if user.tag}
						<span class="badge badge-sm badge-accent">{user.tag}</span>
					{/if}
				</p>
			</div>
		</a>
		{#if !mini}
			<div class={`px-3 w-full text-left ${fixedHeight ? "h-3/4" : ""}`}>
				<p>
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("user.rks")}</span
					>{user.rks.toFixed(3)}
				</p>
				<p>
					<span class="badge badge-primary badge-outline mr-1"
						>{$t("user.exp")}</span
					>{user.exp}
				</p>
				{#if user.bio}
					<p class="content bio">
						<span class="badge badge-primary badge-outline mr-1"
							>{$t("user.bio")}</span
						>{user.bio}
					</p>
				{/if}
			</div>
		{/if}
		{#if showButton}
			<div
				class={error ? "tooltip tooltip-open tooltip-error tooltip-bottom" : ""}
				data-tip={error}
			>
				{#if !isFollowing}
					<button
						class="w-fit btn btn-outline btn-primary glass text-sm"
						on:click={follow}>{$t("user.follow")} {fans}</button
					>
				{:else}
					<button
						class="w-fit btn btn-outline btn-ghost text-sm"
						on:click={unfollow}>{$t("user.unfollow")} {fans}</button
					>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.bio {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>
