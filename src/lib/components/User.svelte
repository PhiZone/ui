<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import type { UserDto } from '$lib/api';

  import { page } from '$app/state';
  import { t } from '$lib/translations/config';
  import { getAvatar, getUserColor, getUserLevel } from '$lib/utils';

  import Follow from './Follow.svelte';

  let { api } = $derived(page.data);

  interface Props {
    id: number;
    initUser?: UserDto;
    kind?: 'full' | 'mini' | 'embedded' | 'embedded-mini';
    fixedHeight?: boolean;
    showFollow?: boolean;
    target?: string;
  }
  let {
    id,
    initUser,
    kind = 'full',
    fixedHeight = false,
    showFollow = true,
    target = '_self',
  }: Props = $props();

  let query = $derived(createQuery(api.user.info({ id }, { enabled: !initUser })));
</script>

{#if kind === 'embedded' || kind === 'embedded-mini'}
  {#if !initUser && $query.isLoading}
    <div class="avatar {kind === 'embedded' ? 'flex-col' : ''} items-center">
      <div class="{kind === 'embedded' ? 'w-[72px]' : 'w-10'} rounded-full skeleton"></div>
      <p class="h-7 max-w-[120px] rounded skeleton"></p>
    </div>
    <div class="flex gap-1">
      <span class="h-4 w-6 skeleton"></span>
    </div>
  {:else if initUser || $query.isSuccess}
    {@const user = initUser ?? $query.data?.data}
    {#if user}
      <a
        href="/users/{user.id}"
        {target}
        class="avatar {kind === 'embedded'
          ? 'flex-col w-full'
          : 'w-1/6 min-w-fit'} items-center gap-1 hover:underline"
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
              <span class="badge badge-sm badge-accent truncate">
                {user.tag}
              </span>
            {/if}
            {#if 'position' in user && user.position}
              <span class="badge badge-sm badge-neutral truncate">
                {user.position}
              </span>
            {/if}
          </div>
        {/if}
      </a>
    {/if}
  {/if}
{:else}
  <a
    href={initUser || $query.isSuccess ? `/users/${initUser?.id ?? $query.data?.data.id}` : ''}
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
            <div class="w-12 rounded-full skeleton"></div>
            <p class="ml-2 flex gap-1 items-center">
              <span class="rounded h-5 w-16 skeleton"></span>
              <span class="rounded h-5 w-10 skeleton"></span>
            </p>
          </div>
        </div>
        {#if kind === 'full'}
          <div class="px-3 w-full flex flex-col gap-2 {fixedHeight ? 'h-3/4' : ''}">
            <span class="rounded h-6 w-full skeleton"></span>
            <span class="rounded h-6 w-full skeleton"></span>
            <span class="rounded h-6 w-full skeleton"></span>
          </div>
        {/if}
        {#if showFollow}
          <div class="w-24 h-12 btn btn-disabled"></div>
        {/if}
      {:else if initUser || $query.isSuccess}
        {@const user = initUser ?? $query.data?.data}
        {#if user}
          <div class="avatar flex items-center">
            <div
              class="w-12 rounded-full border-[3px] border-opacity-80 border-{getUserColor(
                user.role,
              )}"
            >
              <img src={getAvatar(user.avatar)} alt="Avatar" />
            </div>
            <p
              class="text-lg ml-2 text-{getUserColor(user.role)} flex flex-wrap gap-1 items-center"
            >
              {user.userName}
              <span class="badge badge-sm font-bold">
                LV{getUserLevel(user.experience)}
              </span>
              {#if user.tag}
                <span class="badge badge-sm badge-accent truncate">
                  {user.tag}
                </span>
              {/if}
              {#if 'position' in user && user.position}
                <span class="badge badge-sm badge-neutral truncate">
                  {user.position}
                </span>
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
            <!-- TODO: preventDefault -->
            <Follow {user} />
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
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
