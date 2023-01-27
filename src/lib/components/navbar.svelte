<script lang="ts">
	import { t } from "$lib/translations/config";
	import { goto, preloadData } from "$app/navigation";
	import { page } from "$app/stores";
	import { getCompressedImage, getUserPrivilege } from "$lib/utils";
	import type { User } from "$lib/models";
	export let showUser = true,
		user: User | undefined;
</script>

<div
	class="navbar shadow-lg bg-base-100 bg-opacity-50 backdrop-blur-lg text-base"
>
	<div class="navbar-start z-20">
		<img src="/favicon.ico" alt="logo" class="logo" />
		<a
			data-sveltekit-preload-data
			class="title normal-case font-extrabold text-xl"
			href="/">{$t("common.title")}</a
		>
		<div class="dropdown">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label tabindex="-1" class="btn btn-ghost lg:hidden">
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
						d="M4 6h16M4 12h8m-8 6h16"
					/></svg
				>
			</label>
			<ul
				tabindex="-1"
				class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
			>
				<li>
					<a data-sveltekit-preload-data href="/chapters"
						>{$t("common.chapters")}</a
					>
				</li>
				<li>
					<a data-sveltekit-preload-data href="/songs">{$t("common.songs")}</a>
				</li>
				<li>
					<a data-sveltekit-preload-data href="/charts">{$t("common.charts")}</a
					>
				</li>
				<li>
					<a data-sveltekit-preload-data href="/records"
						>{$t("common.records")}</a
					>
				</li>
				<!-- <li><a data-sveltekit-preload-data href="/apps">{$t("common.navbar.apps")}</a></li>
				<li><a data-sveltekit-preload-data href="/discussions">{$t("common.discussions")}</a></li> -->
				<li>
					<a data-sveltekit-preload-data href="/recorder"
						>{$t("common.navbar.recorder")}</a
					>
				</li>
				<!-- {#if user && getUserPrivilege(user?.type?.toString()) < 2}
					<li>
						<a data-sveltekit-preload-data href="/challenge">{$t("common.navbar.privilege_escalation")}</a>
					</li>
				{/if} -->
			</ul>
		</div>
		{#if $page.url.pathname.startsWith("/studio")}
			<label
				for="studio-sidebar"
				class="btn btn-primary btn-outline drawer-button lg:hidden"
				>{$t("studio.drawer")}</label
			>
		{/if}
	</div>
	<div class="navbar-center hidden lg:flex">
		<ul class="menu menu-horizontal rounded-full p-0">
			<li>
				<a data-sveltekit-preload-data href="/chapters"
					>{$t("common.chapters")}</a
				>
			</li>
			<li>
				<a data-sveltekit-preload-data href="/songs">{$t("common.songs")}</a>
			</li>
			<li>
				<a data-sveltekit-preload-data href="/charts">{$t("common.charts")}</a>
			</li>
			<li>
				<a data-sveltekit-preload-data href="/records">{$t("common.records")}</a
				>
			</li>
			<!-- <li class="rounded-full">
				<a data-sveltekit-preload-data href="/apps">{$t("common.navbar.apps")}</a>
			</li>
			<li class="rounded-full">
				<a data-sveltekit-preload-data href="/discussions">{$t("common.discussions")}</a>
			</li> -->
			<li>
				<a data-sveltekit-preload-data href="/recorder"
					>{$t("common.navbar.recorder")}</a
				>
			</li>
			<!-- {#if user && getUserPrivilege(user?.type?.toString()) < 2}
				<li class="rounded-full">
					<a data-sveltekit-preload-data href="/challenge">{$t("common.navbar.privilege_escalation")}</a>
				</li>
			{/if} -->
		</ul>
	</div>
	<div class="navbar-end">
		<a data-sveltekit-preload-data href="/search">
			<button class="btn btn-ghost btn-circle">
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
						d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
					/></svg
				>
			</button></a
		>
		{#if showUser}
			{#if user}
				<a data-sveltekit-preload-data href="/me/notifications">
					<button class="btn btn-ghost btn-circle">
						<div class="indicator">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
								/>
							</svg>
							{#if user.notifications && user.notifications > 0 && !$page.url.pathname.startsWith("/me/notifications")}
								<span class="badge h-4 badge-xs badge-secondary indicator-item"
									>{user.notifications}</span
								>
							{/if}
						</div>
					</button>
				</a>
				<div class="ml-3 dropdown dropdown-end">
					<!-- svelte-ignore a11y-label-has-associated-control -->
					<label
						tabindex="-1"
						class={`btn h-14 w-14 btn-ghost border-0 btn-circle avatar bg-opacity-80 ${
							user.type == "admin"
								? "bg-indigo-500"
								: user.type == "volunteer"
								? "bg-emerald-500"
								: user.type == "qualified"
								? "bg-sky-500"
								: ""
						}`}
					>
						<div class="w-12 rounded-full">
							<img
								src={getCompressedImage(user.avatar)}
								alt="avatar"
								class="bg-white"
							/>
						</div>
					</label>
					<ul
						tabindex="-1"
						class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
					>
						<li>
							<a class="justify-between" href={`/users/${user.id}`}>
								{user.username}
								<!-- <span class="badge">{userDetail.tag}</span> -->
							</a>
						</li>
						{#if getUserPrivilege(user.type) < 2}
							<li class="disabled">
								<div
									class="tooltip tooltip-left tooltip-warning text-left"
									data-tip={$t("common.unavailable")}
								>
									<p>{$t("common.studio")}</p>
								</div>
							</li>
						{:else}
							<li>
								<a data-sveltekit-preload-data href="/studio"
									>{$t("common.studio")}</a
								>
							</li>
						{/if}
						<li>
							<a data-sveltekit-preload-data href="/me/settings"
								>{$t("common.settings")}</a
							>
						</li>
						<li>
							<a href="/session/logout">{$t("common.navbar.logout")}</a>
						</li>
					</ul>
				</div>
			{:else}
				<div class="ml-2 btn-group user">
					<button
						class="btn btn-outline btn-accent glass"
						on:click={async () => {
							goto("/session/register");
						}}
						on:pointerenter={async () => {
							preloadData("/session/register");
						}}>{$t("session.registration.register")}</button
					>
					<button
						class="btn btn-outline btn-secondary glass"
						on:click={async () => {
							goto("/session/login");
						}}
						on:pointerenter={async () => {
							preloadData("/session/login");
						}}>{$t("session.login.login")}</button
					>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	* {
		font-family: "Saira", sans-serif;
		font-size: 18px;
	}

	.logo {
		max-height: 60px;
		margin-right: 10px;
		filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.25));
	}
	.title {
		font-size: 35px;
		font-weight: 600;
		margin-left: 10px;
		margin-right: 10px;
	}
	.navbar {
		position: fixed;
		top: 0;
		width: 100%;
		margin: auto;
		padding-left: 3%;
		padding-right: 3%;
		z-index: 900;
	}
</style>
