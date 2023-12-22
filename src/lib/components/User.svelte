<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import { getAvatar, getUserColor, getUserLevel } from '$lib/utils';
  import type { UserDto } from '$lib/api';
  import Follow from './Follow.svelte';

  $: ({ api } = $page.data);

  export let id: number;
  export let initUser: UserDto | undefined = undefined;
  export let kind: 'full' | 'mini' | 'embedded' | 'embedded-mini' = 'full';
  export let fixedHeight = false;
  export let showFollow = true;
  export let target = '_self';

  $: query = createQuery(api.user.info({ id }, { enabled: !initUser }));
</script>

{#if kind === 'embedded' || kind === 'embedded-mini'}
  {#if !initUser && $query.isLoading}
    <div class="avatar {kind === 'embedded' ? 'flex-col' : ''} items-center">
      <div class="{kind === 'embedded' ? 'w-[72px]' : 'w-10'} rounded-full skeleton" />
      <p class="h-7 max-w-[120px] rounded skeleton" />
    </div>
    <div class="flex gap-1">
      <span class="h-4 w-6 skeleton" />
    </div>
  {:else if initUser || $query.isSuccess}
    {@const user = initUser ?? $query.data?.data}
    {#if user}
      <a
        href="/users/{user.id}"
        {target}
        class="avatar {kind === 'embedded'
          ? 'flex-col w-full'
          : 'w-1/6 min-w-fit'} items-center gap-1"
      >
        <div
          class="{kind === 'embedded'
            ? 'w-full max-w-[72px] border-[3px] border-opacity-80'
            : 'w-10 border-2'} rounded-full border-{getUserColor(user.role)}"
        >
          <img class="object-fill" src={getAvatar(user.avatar)} alt="Avatar" />
        </div>
        <p class="{kind === 'embedded' ? 'text-lg' : 'text-base'} text-center truncate w-full">
          {user.userName}
        </p>
        {#if kind === 'embedded'}
          <div class="flex flex-wrap gap-1 !aspect-auto">
            <span class="badge badge-sm font-bold">LV{getUserLevel(user.experience)}</span>
            {#if user.tag}
              <span class="badge badge-sm badge-accent">{user.tag}</span>
            {/if}
          </div>
        {/if}
      </a>
    {/if}
  {/if}
{:else}
  <a
    href={initUser || $query.isSuccess ? `/users/${initUser?.id ?? $query.data?.data.id}` : '#'}
    {target}
    class="card bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
    class:w-80={kind === 'full'}
    class:h-60={fixedHeight}
  >
    <div
      class="card-body py-3 px-4 items-center {kind === 'mini'
        ? 'flex-row gap-8 justify-between'
        : ''}"
    >
      {#if !initUser && $query.isLoading}
        <div>
          <div class="avatar flex items-center min-w-fit">
            <div class="w-12 rounded-full skeleton" />
            <p class="ml-2 flex gap-1 items-center">
              <span class="rounded h-5 w-16 skeleton" />
              <span class="rounded h-5 w-10 skeleton" />
            </p>
          </div>
        </div>
        {#if kind === 'full'}
          <div class="px-3 w-full flex flex-col gap-2 {fixedHeight ? 'h-3/4' : ''}">
            <span class="rounded h-6 w-full skeleton" />
            <span class="rounded h-6 w-full skeleton" />
            <span class="rounded h-6 w-full skeleton" />
          </div>
        {/if}
        {#if showFollow}
          <button class="w-24 h-12 btn" disabled />
        {/if}
      {:else if initUser || $query.isSuccess}
        {@const user = initUser ?? $query.data?.data}
        {#if user}
          <div class="avatar flex items-center min-w-fit">
            <div
              class="w-12 rounded-full border-[3px] border-opacity-80 border-{getUserColor(
                user.role,
              )}"
            >
              <img src={getAvatar(user.avatar)} alt="Avatar" />
            </div>
            <p
              class="text-lg ml-2 text-{getUserColor(user.role)} flex gap-1 items-center min-w-fit"
            >
              {user.userName}
              <span class="hidden sm:flex badge badge-sm font-bold">
                LV{getUserLevel(user.experience)}
              </span>
              {#if user.tag}
                <span class="hidden sm:flex badge badge-sm badge-accent">{user.tag}</span>
              {/if}
            </p>
          </div>
          {#if kind === 'full'}
            <div class="px-3 w-full text-left {fixedHeight ? 'h-3/4' : ''}">
              <p>
                <span class="badge mr-1">{$t('user.rks')}</span>
                {user.rks.toFixed(3)}
              </p>
              <p>
                <span class="badge mr-1">{$t('user.exp')}</span>
                {user.experience.toLocaleString()}
              </p>
              {#if user.biography}
                <p class="content bio">
                  <span class="badge mr-1">{$t('user.bio')}</span>
                  {user.biography}
                </p>
              {/if}
            </div>
          {/if}
          {#if showFollow}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
              on:click={(e) => {
                e.preventDefault();
              }}
              on:keyup
            >
              <Follow {user} />
            </div>
          {/if}
        {/if}
      {/if}
    </div>
  </a>
{/if}

<style>
  .bio {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
