<script lang="ts">
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import { getAvatar, getUserColor, getUserPrivilege } from '$lib/utils';
</script>

<div
  class="navbar fixed top-0 w-full h-16 m-auto px-[3%] z-[900] shadow-lg bg-base-100 bg-opacity-70 backdrop-blur-lg text-base"
>
  <div class="navbar-start w-[160px] lg:w-1/2 z-20">
    <div class="dropdown">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label tabindex="-1" class="btn btn-ghost btn-circle lg:hidden">
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
            d="M4 6h16M4 12h8m-8 6h16"
          />
        </svg>
      </label>
      <ul
        tabindex="-1"
        class="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-xl w-52"
      >
        <li>
          <a href="/chapters">{$t('common.chapters')}</a>
        </li>
        <li>
          <a href="/songs">{$t('common.songs')}</a>
        </li>
        <li>
          <a href="/charts">{$t('common.charts')}</a>
        </li>
        <li>
          <a href="/users">{$t('common.users')}</a>
        </li>
        <li>
          <a href="/records">{$t('common.records')}</a>
        </li>
      </ul>
    </div>
    <a class="title flex items-center normal-case font-extrabold text-2xl lg:text-4xl" href="/">
      <img src="/favicon.ico" alt="Logo" class="logo hidden lg:block" />
      {$t('common.title')}
    </a>
    {#if $page.url.pathname.startsWith('/studio')}
      <label for="studio-sidebar" class="btn btn-primary btn-outline drawer-button mx-4 lg:hidden">
        {$t('studio.drawer')}
      </label>
    {/if}
  </div>
  <div class="navbar-center hidden lg:flex">
    <ul class="menu menu-horizontal p-0 text-lg">
      <li>
        <a href="/chapters">{$t('common.chapters')}</a>
      </li>
      <li>
        <a href="/songs">{$t('common.songs')}</a>
      </li>
      <li>
        <a href="/charts">{$t('common.charts')}</a>
      </li>
      <li>
        <a href="/users">{$t('common.users')}</a>
      </li>
      <li>
        <a href="/records">{$t('common.records')}</a>
      </li>
      <!-- <li class="rounded-full">
				<a href="/apps">{$t("common.navbar.apps")}</a>
			</li>
			<li class="rounded-full">
				<a href="/discussions">{$t("common.discussions")}</a>
			</li> -->
      <!-- <li>
        <a href="/recorder">{$t('common.navbar.recorder')}</a>
      </li> -->
      {#if !$page.url.pathname.startsWith('/session')}
        {@const { user } = $page.data}
        {#if user && getUserPrivilege(user.role) < 2}
          <li class="rounded-full">
            <a
              href="https://phi-zone.feishu.cn/share/base/form/shrcniSUPXn7kEhpM1p8BmtrYKc"
              target="_blank"
            >
              {$t('common.navbar.privilege_escalation')}
            </a>
            <!-- <a href="/challenge">{$t('common.navbar.privilege_escalation')}</a> -->
          </li>
        {/if}
      {/if}
    </ul>
  </div>
  <div class="navbar-end flex-grow">
    {#if !$page.url.pathname.startsWith('/session')}
      {#if $page.data.user}
        {@const { user } = $page.data}
        <a data-sveltekit-preload-code href="/me/notifications">
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
              {#if user.notifications && user.notifications > 0 && !$page.url.pathname.startsWith('/me/notifications')}
                <span class="badge h-4 badge-xs badge-secondary indicator-item">
                  {user.notifications}
                </span>
              {/if}
            </div>
          </button>
        </a>
        <div class="dropdown dropdown-end">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label
            tabindex="-1"
            class="btn h-14 w-14 btn-ghost border-0 btn-circle avatar bg-opacity-80 bg-{getUserColor(
              user.role,
            )}"
          >
            <div class="w-12 rounded-full">
              <img src={getAvatar(user.avatar)} alt="Avatar" class="bg-white" />
            </div>
          </label>
          <ul
            tabindex="-1"
            class="menu menu-compact lg:menu-normal dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box text-base w-52"
          >
            <li>
              <a class="justify-between" href={`/users/${user.id}`}>
                {user.userName}
                <!-- <span class="badge">{userDetail.tag}</span> -->
              </a>
            </li>
            {#if getUserPrivilege(user.role) < 2}
              <li class="disabled">
                <div
                  class="tooltip tooltip-left tooltip-warning text-left"
                  data-tip={$t('common.unavailable')}
                >
                  <p>{$t('common.studio')}</p>
                </div>
              </li>
            {:else}
              <li>
                <a href="/studio">{$t('common.studio')}</a>
              </li>
            {/if}
            <li>
              <a href="/me/settings">{$t('common.settings')}</a>
            </li>
            <li>
              <a data-sveltekit-preload-data="off" href="/session/logout">
                {$t('common.navbar.logout')}
              </a>
            </li>
          </ul>
        </div>
      {:else}
        <div class="flex">
          <a
            class="btn btn-ghost btn-md text-base"
            href="/session/register?redirect={$page.url.pathname}"
          >
            {$t('session.registration.register')}
          </a>
          <a
            class="btn btn-outline btn-secondary btn-md text-base"
            href="/session/login?redirect={$page.url.pathname}"
          >
            {$t('session.login.login')}
          </a>
        </div>
      {/if}
    {/if}
  </div>
</div>

<style>
  * {
    font-family: 'Saira', sans-serif;
  }

  .logo {
    max-height: 60px;
    margin-right: 10px;
    filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.25));
  }
</style>
