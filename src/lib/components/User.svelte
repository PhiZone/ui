<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getUserColor, getUserLevel } from '$lib/utils';
  import type { User } from '$lib/models';
  import Follow from './Follow.svelte';

  $: ({ api } = $page.data);

  export let id: number;
  export let user: User | undefined = undefined;
  export let kind: 'full' | 'mini' | 'embedded' | 'embedded-mini' = 'full';
  export let fixedHeight = false;
  export let showFollow = true;

  $: query = createQuery(api.user.info({ id }, { initialData: user }));
</script>

{#if kind === 'embedded' || kind === 'embedded-mini'}
  {#if $query.isLoading}
    <div class="avatar {kind === 'embedded' ? 'flex-col' : ''} items-center animate-pulse">
      <div class="{kind === 'embedded' ? 'w-[72px]' : 'w-10'} rounded-full bg-slate-200" />
      <p class="h-7 max-w-[120px] rounded bg-slate-200" />
    </div>
    <div class="flex gap-1">
      <span class="h-4 w-6 bg-slate-200" />
    </div>
  {:else if $query.isSuccess}
    {@const user = $query.data}
    <a
      href="/users/{user.id}"
      class="avatar {kind === 'embedded'
        ? 'flex-col'
        : 'w-1/6 min-w-fit whitespace-nowrap text-ellipsis'} items-center gap-1 overflow-hidden"
    >
      <div
        class="{kind === 'embedded'
          ? 'w-[72px] border-[3px] border-opacity-80'
          : 'w-10 border-2'} rounded-full {user.type == 'admin'
          ? 'border-indigo-500'
          : user.type == 'volunteer'
          ? 'border-emerald-500'
          : user.type == 'qualified'
          ? 'border-sky-500'
          : 'border-neutral-500'}"
      >
        <img class="object-fill" src={getCompressedImage(user.avatar)} alt="Avatar" />
      </div>
      <p class="{kind === 'embedded' ? 'text-lg' : 'text-base'} text-center max-w-[120px]">
        {user.username}
      </p>
      <div class="flex flex-wrap gap-1 !aspect-auto">
        <span class="badge badge-sm font-bold">LV{getUserLevel(user.exp)}</span>
        {#if kind === 'embedded' && user.tag}
          <span class="badge badge-sm badge-accent">{user.tag}</span>
        {/if}
      </div>
    </a>
  {/if}
{:else}
  <div class="card w-full shadow-lg bg-base-100" class:h-60={fixedHeight}>
    <div
      class="card-body py-3 px-4 items-center {kind === 'mini'
        ? 'flex-row gap-8 justify-between'
        : ''}"
      class:animate-pulse={$query.isLoading}
    >
      {#if $query.isLoading}
        <div>
          <div class="avatar flex items-center min-w-fit">
            <div class="w-12 rounded-full bg-slate-200" />
            <p class="ml-2 flex gap-1 items-center">
              <span class="rounded h-5 w-16 bg-slate-200" />
              <span class="rounded h-5 w-10 bg-slate-200" />
            </p>
          </div>
        </div>
        {#if kind === 'full'}
          <div class="px-3 w-full flex flex-col gap-2 {fixedHeight ? 'h-3/4' : ''}">
            <span class="rounded h-6 w-full bg-slate-200" />
            <span class="rounded h-6 w-full bg-slate-200" />
            <span class="rounded h-6 w-full bg-slate-200" />
          </div>
        {/if}
        {#if showFollow}
          <button class="w-24 h-12 btn" disabled />
        {/if}
      {:else if $query.isSuccess}
        {@const user = $query.data}
        <a href="/users/{user.id}">
          <div class="avatar flex items-center min-w-fit">
            <div
              class="w-12 rounded-full border-[3px] border-opacity-80 border-{getUserColor(
                user.type
              )}"
            >
              <img src={getCompressedImage(user.avatar)} alt="Avatar" />
            </div>
            <p class="text-lg ml-2 text-[{getUserColor(user.type)}] flex gap-1 items-center">
              {user.username}
              <span class="badge badge-sm font-bold">LV{getUserLevel(user.exp)}</span>
              {#if user.tag}
                <span class="badge badge-sm badge-accent">{user.tag}</span>
              {/if}
            </p>
          </div>
        </a>
        {#if kind === 'full'}
          <div class="px-3 w-full text-left {fixedHeight ? 'h-3/4' : ''}">
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('user.rks')}</span>
              {user.rks.toFixed(3)}
            </p>
            <p>
              <span class="badge badge-primary badge-outline mr-1">{$t('user.exp')}</span>
              {user.exp}
            </p>
            {#if user.bio}
              <p class="content bio">
                <span class="badge badge-primary badge-outline mr-1">{$t('user.bio')}</span>
                {user.bio}
              </p>
            {/if}
          </div>
        {/if}
        {#if showFollow}
          <Follow {id} {user} />
        {/if}
      {/if}
    </div>
  </div>
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
