<script>
    import { t } from '$lib/translations/config';
    import { goto } from '$app/navigation';
    import { getUserPrivilege } from '$lib/utils';
    export let showUser = true;

    /**
     * @type {import('$lib/models').User | undefined}
     */
    export let user;

    export const register = async () => {
        goto('/session/register');
    };
    export const login = async () => {
        goto('/session/login');
    };
</script>

<div class="navbar glass bg-primary text-primary-content">
    <div class="navbar-start">
        <img src="/favicon.ico" alt="logo" class="logo" />
        <a class="title normal-case text-xl" href="/">{$t('common.title')}</a>
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
                <li><a href="/charts">{$t('common.charts')}</a></li>
                <li><a href="/apps">{$t('common.navbar.apps')}</a></li>
                <li><a href="/discussions">{$t('common.discussions')}</a></li>
                {#if user && getUserPrivilege(user?.type?.toString()) < 2}
                    <li>
                        <a href="/challenge">{$t('common.navbar.privilege_escalation')}</a>
                    </li>
                {/if}
            </ul>
        </div>
    </div>
    <div class="navbar-center hidden lg:flex">
        <ul class="menu menu-horizontal p-0">
            <li><a href="/charts">{$t('common.charts')}</a></li>
            <li><a href="/apps">{$t('common.navbar.apps')}</a></li>
            <li><a href="/discussions">{$t('common.discussions')}</a></li>
            {#if user && getUserPrivilege(user?.type?.toString()) < 2}
                <li>
                    <a href="/challenge">{$t('common.navbar.privilege_escalation')}</a>
                </li>
            {/if}
        </ul>
    </div>
    <div class="navbar-end">
        <a href="/search">
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
                <button class="btn btn-ghost btn-circle">
                    <div class="indicator">
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
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            /></svg
                        >
                        {#if user.notifications && user.notifications > 0}
                            <span class="badge h-4 badge-xs badge-primary indicator-item"
                                >{user.notifications}</span
                            >
                        {/if}
                    </div>
                </button>
                <div class="ml-3 dropdown dropdown-end">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label tabindex="-1" class="btn btn-ghost btn-circle avatar">
                        <div class="w-10 rounded-full">
                            <img src={`${user.avatar}`} alt="avatar" />
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
                        {#if getUserPrivilege(user.type?.toString()) < 2}
                            <li class="disabled">
                                <div
                                    class="tooltip tooltip-left tooltip-warning text-left"
                                    data-tip={$t('common.navbar.studio_inaccessible')}
                                >
                                    <p>{$t('common.navbar.studio')}</p>
                                </div>
                            </li>
                        {:else}
                            <li>
                                <a href="/studio">{$t('common.navbar.studio')}</a>
                            </li>
                        {/if}
                        <li>
                            <a href="/settings">{$t('common.navbar.settings')}</a>
                        </li>
                        <li><a href="/auth/logout">{$t('common.navbar.logout')}</a></li>
                    </ul>
                </div>
            {:else}
                <div class="btn-group user">
                    <button class="btn btn-outline btn-accent glass" on:click={register}
                        >{$t('session.registration.register')}</button
                    >
                    <button class="btn btn-outline btn-primary glass" on:click={login}
                        >{$t('session.login.login')}</button
                    >
                </div>
            {/if}
        {/if}
    </div>
</div>

<style>
    * {
        font-family: 'Saira', sans-serif;
        font-size: 18px;
    }

    .logo {
        max-height: 60px;
        margin-right: 10px;
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
        backdrop-filter: blur(6px);
        box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.3);
        background-color: rgba(255, 255, 255, 0.8);
        padding-left: 3%;
        padding-right: 3%;
        z-index: 114514;
    }
</style>
