<script lang="ts">
  import { t } from '$lib/translations/config';
  import { createQuery } from '@tanstack/svelte-query';
  import Hostship from '$lib/components/Hostship.svelte';
  import { getUserPrivilege, hasEventPermission } from '$lib/utils';
  import { Status } from '$lib/constants';
  import { analyze, CREATE, gen, HOSTSHIP } from '$lib/hostshipPermissions';
  import Tag from '$lib/components/Tag.svelte';

  export let data;

  $: ({ id, user, api, url } = data);

  $: event = createQuery(api.event.info({ id }));
  $: hostships = createQuery(api.event.listAllHostships({ rangeEventId: [id] }));

  $: isOwner = getUserPrivilege(user?.role) >= 6 || $event.data?.data.ownerId === user?.id;
  $: isAdmin =
    getUserPrivilege(user?.role) >= 6 ||
    user?.hostships?.some((hostship) => $event.data?.data.id === id && hostship.isAdmin);

  let status = Status.WAITING;
  let copied = false;
  let errorCode = '';
  let inviteCode = '';
  let showTags = true;

  let newIsAdmin = false;
  let newIsUnveiled = false;
  let newPosition = '';
  let newPermissions: number[] = [];

  let permissionOpen = false;
  let permissionOperation = 0;
  let permissionScope = 0;
  let permissionIndex = 0;

  const createInvitation = async () => {
    status = Status.SENDING;
    errorCode = '';
    const resp = await api.event.createInvite({
      id,
      isAdmin: newIsAdmin,
      isUnveiled: newIsUnveiled,
      position: newPosition,
      permissions: newPermissions,
    });
    if (resp.ok) {
      status = Status.OK;
      inviteCode = (await resp.json()).data.code;
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
    }
  };
</script>

<svelte:head>
  <title>
    {$t('event.host_team')}
    | {$t('event.event')} - {$event.data?.data.title} | {$t('common.site_name')}
  </title>
</svelte:head>
<input type="checkbox" id="invite" class="modal-toggle" />
<div class="modal">
  <div class="modal-box text-left">
    <label
      for="invite"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg">{$t('event.team.invitation.invite_code')}</h3>
    <div class="flex flex-col mb-2">
      <div class="form-control">
        <label class="cursor-pointer label">
          <span class="label-text">{$t('event.hostship.is_admin')}</span>
          <input
            type="checkbox"
            bind:checked={newIsAdmin}
            disabled={!isOwner}
            class="checkbox transition-all border-2 normal-border {!isOwner
              ? 'checkbox-disabled'
              : 'hover:checkbox-secondary'}"
          />
        </label>
      </div>
      <div class="form-control">
        <label class="cursor-pointer label">
          <span class="label-text">{$t('common.is_unveiled')}</span>
          <input
            type="checkbox"
            bind:checked={newIsUnveiled}
            class="checkbox transition-all border-2 normal-border hover:checkbox-secondary"
          />
        </label>
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <div class="relative">
        <input
          type="text"
          placeholder={`${$t('common.position')}${$t('common.optional')}`}
          class="input transition border-2 normal-border w-full hover:input-secondary"
          bind:value={newPosition}
        />
        <div class="absolute right-2 inset-y-0 flex items-center">
          <button
            type="button"
            class="btn btn-sm {newPosition
              ? 'border-2 hover:btn-outline backdrop-blur'
              : 'btn-disabled'}"
            on:click={() => {
              newPosition = '';
            }}
          >
            {$t('common.empty_v')}
          </button>
        </div>
      </div>
      {#if newPermissions && showTags}
        <div class="flex gap-1 flex-wrap items-center">
          <span class="badge badge-outline border-2 normal-border">
            <p>{$t('event.hostship.permissions')}</p>
          </span>
          {#each newPermissions as permission, i}
            {@const { operation, scope, index } = analyze(permission)}
            {@const tag =
              $t('event.hostship.permission_text', {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                operation: $t(`event.hostship.operations.${operation}`),
                scope: $t(`event.hostship.scopes.${scope}`),
              }) + (scope == 4 && index > 0 ? ` (${index})` : '')}
            {#if isAdmin}
              <Tag
                {tag}
                removeFunction={() => {
                  showTags = false;
                  newPermissions.splice(i, 1);
                  setTimeout(() => {
                    showTags = true;
                  }, 0);
                }}
              />
            {:else}
              <Tag {tag} />
            {/if}
          {/each}
          {#if isAdmin}
            <label
              for="new-permission-{$event.data?.data.id}"
              class="btn border-2 normal-border btn-outline btn-xs btn-circle"
            >
              <i class="fa-solid fa-plus"></i>
            </label>
          {/if}
        </div>
      {/if}
    </div>
    <div class="flex items-center justify-center py-6 h-28">
      {#if inviteCode && status !== Status.SENDING}
        <p class="text-5xl font-bold font-mono tracking-widest">{inviteCode}</p>
      {:else}
        <span class="loading loading-dots loading-lg"></span>
      {/if}
    </div>
    <p class="opacity-70 pb-7">{$t('event.hostship.invite_description')}</p>
    <div class="flex flex-col md:flex-row gap-6 justify-center mx-auto">
      <button
        class="btn btn-outline border-2 {copied
          ? 'btn-success btn-active'
          : 'normal-border'} md:w-2/5 w-full"
        on:click={() => {
          navigator.clipboard.writeText(
            $t('event.hostship.invite_msg', {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              user: user.userName,
              event: $event.data?.data.title,
              link: `${url.protocol}//${url.host}/events/invite?code=${inviteCode}`,
            }),
          );
          copied = true;
          setTimeout(() => {
            copied = false;
          }, 2000);
        }}
      >
        {#if !copied}
          <span>
            {$t('event.team.invitation.copy')}
          </span>
        {:else}
          <span>
            <i class="fa-solid fa-check fa-xl"></i>
          </span>
        {/if}
      </button>
      <div
        class="md:w-2/5 w-full {status === Status.ERROR && errorCode
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
          : ''}"
        data-tip={errorCode ? $t(`error.${errorCode}`) : ''}
      >
        <button
          class="btn {status === Status.ERROR
            ? 'btn-error'
            : status === Status.SENDING
              ? 'btn-ghost'
              : 'btn-outline border-2 normal-border'} w-full"
          disabled={status === Status.SENDING}
          on:click={createInvitation}
        >
          {status === Status.ERROR
            ? $t('common.error')
            : status === Status.SENDING
              ? $t('common.waiting')
              : $t('event.team.invitation.refresh')}
        </button>
      </div>
    </div>
  </div>
</div>
<input
  type="checkbox"
  id="new-permission-{$event.data?.data.id}"
  class="modal-toggle"
  bind:checked={permissionOpen}
/>
<div class="modal">
  <div class="modal-box bg-base-100 form-control gap-3 min-w-[40vw]">
    <h3 class="font-bold text-lg">{$t('common.add')}</h3>
    <label
      for="new-permission-{$event.data?.data.id}"
      class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <form class="w-full form-control gap-4">
      <label class="join w-full">
        <span class="btn no-animation join-item w-1/4 min-w-fit">
          {$t('event.hostship.operation')}
        </span>
        <select
          class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
          bind:value={permissionOperation}
        >
          {#each Array(4).keys() as operation}
            <option value={operation}>
              {$t(`event.hostship.operations.${operation}`)}
            </option>
          {/each}
        </select>
      </label>
      <label class="join w-full">
        <span class="btn no-animation join-item w-1/4 min-w-fit">
          {$t('event.hostship.scope')}
        </span>
        <select
          class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
          bind:value={permissionScope}
        >
          {#each Array(5).keys() as scope}
            <option value={scope}>
              {$t(`event.hostship.scopes.${scope}`)}
            </option>
          {/each}
        </select>
      </label>
      {#if permissionScope == 4}
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-fit">
            {$t('event.hostship.index')}
          </span>
          <input
            type="number"
            min="0"
            class="input transition border-2 normal-border hover:input-secondary w-3/4 join-item"
            bind:value={permissionIndex}
          />
        </label>
      {/if}
      <div class="modal-action mt-3">
        <button
          class="btn btn-outline border-2 normal-border w-full"
          on:click={() => {
            showTags = false;
            const permission = gen(
              permissionOperation,
              permissionScope,
              permissionScope == 4 ? permissionIndex : null,
            );
            newPermissions.push(permission);
            newPermissions = [...new Set(newPermissions)];
            permissionOpen = false;
            setTimeout(() => {
              showTags = true;
            }, 0);
          }}
          on:keyup
        >
          {$t('common.confirm')}
        </button>
      </div>
    </form>
  </div>
</div>
<div class="bg-base-300 min-h-screen">
  <div class="pt-32 pb-4 flex justify-center">
    <div class="w-3/4 max-w-6xl min-w-20">
      <div class="flex justify-between">
        <h1 class="text-4xl font-bold mb-6">{$t('event.host_team')}</h1>
        <div class="join">
          {#if hasEventPermission(user, $event.data?.data, CREATE, HOSTSHIP)}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <label
              for="invite"
              class="btn border-2 normal-border btn-outline join-item"
              on:click={() => {
                if (!inviteCode) createInvitation();
              }}
              on:keyup
            >
              {$t('event.team.invitation.invite_code')}
            </label>
          {/if}
          <a
            href="/events/{$event.data?.data.id}"
            class="btn border-2 normal-border btn-outline join-item"
          >
            {$t('common.back')}
          </a>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('event.members')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            {#if $event.isSuccess && $hostships.isSuccess}
              {@const event = $event.data.data}
              {@const hostships = $hostships.data.data}
              {#if hostships.length > 0}
                <div class="flex flex-col gap-4">
                  {#each hostships as hostship}
                    <Hostship {hostship} {event} {isOwner} {isAdmin} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {:else}
              <span class="self-center loading loading-dots loading-lg"></span>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
