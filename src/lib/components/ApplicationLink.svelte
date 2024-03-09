<script lang="ts">
  import { t } from '$lib/translations/config';
  import { requestIdentity, getAppUserLink, getAvatar } from '$lib/utils';
  import type { ApplicationUserDto } from '$lib/api/user';
  import Delete from './Delete.svelte';
  import { SUPPORTED_APPS } from '$lib/constants';
  import { page } from '$app/stores';

  export let appLink: ApplicationUserDto;
  export let kind: 'full' | 'mini' = 'full';

  $: ({ api } = $page.data);

  const link = appLink.remoteUserId
    ? getAppUserLink(appLink.application.name, appLink.remoteUserId)
    : null;

  let disabled = false;
</script>

{#if kind === 'full'}
  <div
    class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:shadow-lg"
  >
    <div class="card-body py-6 gap-0.5">
      <div class="flex items-center gap-2 w-full mb-1">
        {#if SUPPORTED_APPS.filter((a) => a.branded).find((a) => a.name.toLowerCase() === appLink.application.name.toLowerCase())}
          <i class="fa-brands fa-{appLink.application.name.toLowerCase()} fa-xl"></i>
        {:else}
          <div class="avatar">
            <div class="w-6 rounded-full">
              <img src={getAvatar(appLink.application.avatar)} alt="Avatar" />
            </div>
          </div>
        {/if}
        <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
          {appLink.application.name}
        </h2>
      </div>
      {#if appLink.remoteUserId}
        <p class="flex items-center gap-1">
          <span class="badge">{$t('user.account')}</span>
          {#if link}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              class="whitespace-nowrap overflow-hidden text-ellipsis hover:underline"
            >
              {appLink.remoteUserName ?? appLink.remoteUserId}
            </a>
          {:else}
            <span class="whitespace-nowrap overflow-hidden text-ellipsis">
              {appLink.remoteUserName ?? appLink.remoteUserId}
            </span>
          {/if}
        </p>
      {/if}
      <div class="card-actions justify-end">
        <Delete
          id={appLink.application.name}
          path="me/bindings"
          name="user.account"
          class="btn-sm btn-square"
        />
        <button
          class="btn btn-sm {disabled ? 'btn-ghost' : 'btn-outline border-2 normal-border'}"
          {disabled}
          on:click={async () => {
            disabled = true;
            await requestIdentity(appLink.application.name, api, true);
            disabled = false;
          }}
        >
          {$t('application.reverify')}
        </button>
      </div>
    </div>
  </div>
{:else}
  <div class="flex items-center mx-3 gap-2">
    {#if SUPPORTED_APPS.filter((a) => a.branded).find((a) => a.name.toLowerCase() === appLink.application.name.toLowerCase())}
      <i class="fa-brands fa-{appLink.application.name.toLowerCase()} fa-lg"></i>
    {:else}
      <div class="avatar">
        <div class="w-5 rounded-full">
          <img src={getAvatar(appLink.application.avatar)} alt="Avatar" />
        </div>
      </div>
    {/if}
    {#if appLink.remoteUserId}
      {#if link}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          class="whitespace-nowrap overflow-hidden text-ellipsis hover:underline leading-tight"
        >
          {appLink.remoteUserName ?? appLink.remoteUserId}
        </a>
      {:else}
        <span class="whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
          {appLink.remoteUserName ?? appLink.remoteUserId}
        </span>
      {/if}
    {/if}
  </div>
{/if}
