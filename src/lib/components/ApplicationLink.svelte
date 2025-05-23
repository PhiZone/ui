<script lang="ts">
  import type { ApplicationUserDto } from '$lib/api/user';

  import { page } from '$app/state';
  import { SUPPORTED_APPS } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { getAppUserLink, getAvatar, requestIdentity } from '$lib/utils';

  import Delete from './Delete.svelte';

  let { api } = $derived(page.data);

  interface Props {
    appLink: ApplicationUserDto;
    kind?: 'full' | 'mini';
  }
  let { appLink, kind = 'full' }: Props = $props();

  const link = appLink.remoteUserId
    ? getAppUserLink(appLink.application.name, appLink.remoteUserId)
    : null;

  let disabled = $state(false);
</script>

{#if kind === 'full'}
  <div
    class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:shadow-lg"
  >
    <div class="card-body py-6 gap-0.5">
      <div class="flex items-center gap-2 w-full mb-1">
        {#if SUPPORTED_APPS.filter((a) => a.branded).find((a) => a.name.toLowerCase() === appLink.application.name.toLowerCase())}
          <i class="fa-brands fa-{appLink.application.name.toLowerCase()} fa-2xl"></i>
        {:else}
          <div class="avatar">
            <div class="w-8 rounded-full">
              <img src={getAvatar(appLink.application.avatar)} alt="Avatar" />
            </div>
          </div>
        {/if}
        <h2 class="title truncate">
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
              class="truncate hover:underline"
            >
              {appLink.remoteUserName ?? appLink.remoteUserId}
            </a>
          {:else}
            <span class="truncate">
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
          onclick={async () => {
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
    <div class="w-5 h-5 flex items-center justify-center">
      {#if SUPPORTED_APPS.filter((a) => a.branded).find((a) => a.name.toLowerCase() === appLink.application.name.toLowerCase())}
        <i class="fa-brands fa-{appLink.application.name.toLowerCase()} fa-lg"></i>
      {:else}
        <div class="avatar">
          <div class="rounded-full">
            <img src={getAvatar(appLink.application.avatar)} alt="Avatar" />
          </div>
        </div>
      {/if}
    </div>
    {#if appLink.remoteUserId}
      {#if link}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          class="truncate hover:underline leading-tight"
        >
          {appLink.remoteUserName ?? appLink.remoteUserId}
        </a>
      {:else}
        <span class="truncate leading-tight">
          {appLink.remoteUserName ?? appLink.remoteUserId}
        </span>
      {/if}
    {/if}
  </div>
{/if}
