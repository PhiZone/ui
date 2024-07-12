<script lang="ts">
  import { page } from '$app/stores';
  import type { EventDto, HostshipDto } from '$lib/api/event';
  import type { PatchElement } from '$lib/api/types';
  import { Status } from '$lib/constants';
  import { analyze, gen, HOSTSHIP, REMOVE, UPDATE } from '$lib/hostshipPermissions';
  import { t } from '$lib/translations/config';
  import { applyPatch, hasEventPermission } from '$lib/utils';
  import Delete from './Delete.svelte';
  import Tag from './Tag.svelte';
  import User from './User.svelte';

  const { user, api } = $page.data;

  export let event: EventDto;
  export let hostship: HostshipDto;
  export let isOwner = false;
  export let isAdmin = false;

  let deleted = false;
  let patch = new Array<PatchElement>();
  let status = Status.WAITING;
  let errorCode = '';
  let updateErrors: Map<string, string> | undefined = undefined;
  let showTags = true;

  let permissionOpen = false;
  let permissionOperation = 0;
  let permissionScope = 0;
  let permissionIndex = 0;

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    updateErrors = undefined;
    const resp = await api.event.updateHostship(
      { id: hostship.eventId, userId: hostship.userId },
      patch,
    );
    if (resp.ok) {
      status = Status.OK;
      patch = [];
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      updateErrors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        updateErrors,
      );
    }
  };
</script>

<input
  type="checkbox"
  id="new-permission-{hostship.eventId}-{hostship.userId}"
  class="modal-toggle"
  bind:checked={permissionOpen}
/>
<div class="modal">
  <div class="modal-box bg-base-100 form-control gap-3 min-w-[40vw]">
    <h3 class="font-bold text-lg">{$t('common.add')}</h3>
    <label
      for="new-permission-{hostship.eventId}-{hostship.userId}"
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
            hostship.permissions?.push(permission);
            hostship.permissions = [...new Set(hostship.permissions)];
            patch = applyPatch(patch, 'replace', '/permissions', hostship.permissions);
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
<div class="flex flex-col lg:flex-row gap-3 justify-between items-center">
  <div class="w-full lg:w-1/3">
    <User id={hostship.userId} kind="mini" showFollow={false} />
  </div>
  <div class="w-full lg:w-1/6 flex flex-col">
    <div class="form-control">
      <label class="cursor-pointer label">
        <span class="label-text">{$t('event.hostship.is_admin')}</span>
        <input
          type="checkbox"
          bind:checked={hostship.isAdmin}
          disabled={deleted || !isOwner}
          class="checkbox transition-all border-2 normal-border {deleted || !isOwner
            ? 'checkbox-disabled'
            : 'hover:checkbox-secondary'}"
          on:change={() => {
            patch = applyPatch(patch, 'replace', '/isAdmin', hostship.isAdmin);
          }}
        />
      </label>
    </div>
    <div class="form-control">
      <label class="cursor-pointer label">
        <span class="label-text">{$t('common.is_unveiled')}</span>
        <input
          type="checkbox"
          bind:checked={hostship.isUnveiled}
          disabled={deleted || !hasEventPermission(user, event, UPDATE, HOSTSHIP)}
          class="checkbox transition-all border-2 normal-border {deleted ||
          !hasEventPermission(user, event, UPDATE, HOSTSHIP)
            ? 'checkbox-disabled'
            : 'hover:checkbox-secondary'}"
          on:change={() => {
            patch = applyPatch(patch, 'replace', '/isUnveiled', hostship.isUnveiled);
          }}
        />
      </label>
    </div>
  </div>
  <div class="flex flex-col w-full lg:w-1/3 gap-2">
    <div class="relative">
      <input
        type="text"
        placeholder={`${$t('common.position')}${$t('common.optional')}`}
        class="input input-sm transition border-2 normal-border w-full {deleted ||
        !hasEventPermission(user, event, UPDATE, HOSTSHIP)
          ? 'input-disabled'
          : 'hover:input-secondary'}"
        disabled={deleted || !hasEventPermission(user, event, UPDATE, HOSTSHIP)}
        bind:value={hostship.position}
        on:input={() => {
          patch = applyPatch(patch, 'replace', '/position', hostship.position);
        }}
      />
      <div class="absolute right-1 inset-y-0 flex items-center">
        <button
          type="button"
          class="btn btn-xs {hostship.position && !deleted
            ? 'border-2 hover:btn-outline backdrop-blur'
            : 'btn-disabled'}"
          on:click={() => {
            hostship.position = '';
            patch = applyPatch(patch, 'remove', '/position');
          }}
        >
          {$t('common.empty_v')}
        </button>
      </div>
    </div>
    {#if hostship.permissions && showTags}
      <div class="flex gap-1 flex-wrap items-center">
        <span class="badge badge-outline border-2 normal-border">
          <p>{$t('event.hostship.permissions')}</p>
        </span>
        {#each hostship.permissions as permission, i}
          {@const { operation, scope, index } = analyze(permission)}
          {@const tag =
            $t('event.hostship.permission_text', {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              operation: $t(`event.hostship.operations.${operation}`),
              scope: $t(`event.hostship.scopes.${scope}`),
            }) + (scope == 4 && index > 0 ? ` (${index})` : '')}
          {#if isAdmin && !deleted}
            <Tag
              {tag}
              removeFunction={() => {
                showTags = false;
                hostship.permissions?.splice(i, 1);
                patch = applyPatch(patch, 'replace', '/permissions', hostship.permissions);
                setTimeout(() => {
                  showTags = true;
                }, 0);
              }}
            />
          {:else}
            <Tag {tag} />
          {/if}
        {/each}
        {#if isAdmin && !deleted}
          <label
            for="new-permission-{hostship.eventId}-{hostship.userId}"
            class="btn border-2 normal-border btn-outline btn-xs btn-circle"
          >
            <i class="fa-solid fa-plus"></i>
          </label>
        {/if}
      </div>
    {/if}
  </div>
  {#if hasEventPermission(user, event, UPDATE, HOSTSHIP) && !deleted}
    <div
      class="tooltip tooltip-bottom tooltip-error w-full lg:w-1/12"
      class:tooltip-open={status === Status.ERROR}
      data-tip={status === Status.ERROR
        ? $t(`error.${errorCode}`) ?? $t('common.unknown_error')
        : null}
    >
      <button
        type="submit"
        class="btn {status === Status.ERROR
          ? 'btn-error'
          : status === Status.SENDING
            ? 'btn-ghost'
            : 'btn-outline border-2 normal-border'} w-full"
        disabled={deleted || patch.length === 0 || status === Status.SENDING}
        on:click={update}
      >
        {status === Status.ERROR
          ? $t('common.error')
          : status === Status.SENDING
            ? $t('common.waiting')
            : $t('common.submit')}
      </button>
    </div>
  {/if}
  {#if hasEventPermission(user, event, REMOVE, HOSTSHIP)}
    <div class="flex gap-1 items-center justify-end w-full lg:w-fit min-w-fit">
      <Delete
        id={`${hostship.eventId}/${hostship.userId}`}
        path="events/hostships"
        name="event.member"
        class="btn-sm w-full lg:btn-square"
        onDelete={() => {
          deleted = true;
        }}
      />
    </div>
  {/if}
</div>
