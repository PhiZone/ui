<script lang="ts">
	import * as api from "$lib/api";
	import type { User } from "$lib/models";
	import { t } from "$lib/translations/config";

	export let followed: Boolean, user: User, operator: User, token: string;

	let fans = user.fans,
		error = "";

	const follow = async () => {
		followed = true;
		fans++;
		const resp = await api.POST(
			"relations/",
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
			followed = false;
			fans--;
			setTimeout(() => {
				error = "";
			}, 5000);
		}
	};

	const unfollow = async () => {
		followed = false;
		fans--;
		const resp = await api.POST(
			"relations/",
			{
				followee: user.id,
				operation: 1,
			},
			token,
			operator
		);
		if (!resp.ok) {
			const json = await resp.json();
			error = json.error;
			console.log(json);
			followed = true;
			fans++;
			setTimeout(() => {
				error = "";
			}, 5000);
		}
	};
</script>

<div class="indicator my-4 w-full">
	<span
		class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
		>{$t("chart.owner")}</span
	>
	<div class="card flex-shrink-0 w-full shadow-2xl bg-base-100">
		<div class="card-body py-3 px-4 items-center">
			<div class="avatar items-center min-w-fit">
				<div class="w-10 rounded-full">
					<img src={user.avatar} alt="Avatar" />
				</div>
				<p class="ml-2">{user.username}</p>
			</div>
			<div
				class={error ? "tooltip tooltip-open tooltip-error tooltip-right" : ""}
				data-tip={error}
			>
				{#if !followed}
					<button
						class="w-fit btn btn-outline btn-secondary glass text-sm"
						data-tip={error}
						on:click={follow}>{$t("user.follow")} {fans}</button
					>
				{:else}
					<button
						class="w-fit btn btn-outline btn-ghost glass text-sm"
						on:click={unfollow}>{$t("user.unfollow")} {fans}</button
					>
				{/if}
			</div>
		</div>
	</div>
</div>
