<script lang="ts">
	import { goto } from "$app/navigation";
	import * as api from "$lib/api";
	import type { User } from "$lib/models";

	export let id: number | null,
		likes: number,
		type: string,
		target: number,
		token: string,
		user: User,
		css: string;

	const like = async () => {
		likes++;
		id = -1;
		const resp = await api.POST(
			"/likes/",
			{
				[type]: target,
			},
			token,
			user
		);
		const json = await resp.json();
		if (resp.ok) {
			id = json.id;
		} else {
			likes--;
			id = null;
			console.log(json);
			if (resp.status === 401) {
				goto(
					`/session/login?redirect=${encodeURIComponent(
						window.location.pathname + window.location.search
					)}`
				);
			}
		}
	};

	const unlike = () => {
		likes--;
		const path = `/likes/${id}/`;
		id = null;
		api.DELETE(path, token, user);
	};
</script>

{#if !id}
	<button
		class={`btn btn-${css} btn-primary btn-outline gap-2`}
		on:click={like}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/></svg
		>
		{likes}
	</button>
{:else}
	<button
		class={`btn btn-${css} btn-primary btn-active gap-2`}
		on:click={unlike}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			class="h-5 w-5"
			fill="currentColor"
			viewBox="0 0 24 24"
			stroke="currentColor"
			><path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
			/></svg
		>
		{likes}
	</button>
{/if}
