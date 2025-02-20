<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import Highlight, { LineNumbers } from 'svelte-highlight';
  import csharp from 'svelte-highlight/languages/csharp';
  import darkTheme from 'svelte-highlight/styles/unikitty-dark';
  import lightTheme from 'svelte-highlight/styles/unikitty-light';

  import type { ServiceScriptDto } from '$lib/api/service';
  import type { PatchElement } from '$lib/api/types';

  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import Delete from '$lib/components/Delete.svelte';
  import Error from '$lib/components/Error.svelte';
  import ServiceRequest from '$lib/components/ServiceRequest.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import UpdateSuccess from '$lib/components/UpdateSuccess.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { applyPatch, getUserPrivilege, parseDateTime } from '$lib/utils';

  let { data } = $props();
  let { searchParams, user, id, api } = $derived(data);

  let options = $derived(api.service.info({ id }));
  let query = $derived(createQuery({ ...options }));

  const queryClient = useQueryClient();

  let service: ServiceScriptDto = $state($query.data?.data)!; // FIXME: hack
  let status = $state(Status.WAITING);
  let errorCode = $state('');
  let errors: Map<string, string> | undefined = $state();
  let patch = $state(new Array<PatchElement>());
  let showTags = $state(true);
  let newTag = $state('');

  const prefersDarkColorScheme = () =>
    browser &&
    window &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    errors = undefined;
    const resp = await api.service.update({ id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
      await queryClient.invalidateQueries({ queryKey: options.queryKey });
      patch = [];
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      errors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        errors,
      );
    }
  };

  $effect(() => {
    if (!service && $query.isSuccess) {
      service = $query.data.data;
    }
  });

  let resourcePath = $derived(searchParams?.resourcePath as string | undefined);
  let resourceId = $derived(searchParams?.resourceId as string | undefined);
</script>

<svelte:head>
  <title>
    {$t('service.service')} - {$query.data?.data.name} | {$t('common.site_name')}
  </title>
  {#if prefersDarkColorScheme()}
    {@html darkTheme}
  {:else}
    {@html lightTheme}
  {/if}
</svelte:head>
<UpdateSuccess checked={status === Status.OK} onClick={() => (status = Status.WAITING)} />

{#if $query.isSuccess && service}
  <input
    type="checkbox"
    id="service-update-{service.id}"
    class="modal-toggle"
    checked={status === Status.SENDING || status === Status.ERROR}
  />
  <div class="modal" role="dialog">
    <div class="modal-box min-w-[60vw]">
      <label
        for="service-update-{service.id}"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h3 class="font-bold text-lg mb-2">{$t('service.service')}</h3>
      <form class="w-full form-control">
        <div
          class={errors?.get('name')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={errors?.get('name') ?? ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('common.name')}
            </span>
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="name"
              name="name"
              placeholder={$t('common.name')}
              class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                errors?.get('name') ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={service.name}
              oninput={(e) => {
                patch = applyPatch(patch, 'replace', '/name', e.currentTarget.value);
              }}
            />
          </label>
        </div>
        <div
          class={errors?.get('targetType')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={errors?.get('targetType') ?? ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('service.target_type')}
            </span>
            <select
              id="target_type"
              name="targetType"
              class={`select transition border-2 normal-border join-item w-3/4 ${
                errors?.get('targetType') ? 'hover:select-error' : 'hover:select-secondary'
              }`}
              value={service.targetType}
              oninput={(e) => {
                service.targetType = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/targetType', service.targetType);
              }}
            >
              {#each [...Array(3).keys()] as i}
                <option value={i}>{$t(`service.target_types.${i}`)}</option>
              {/each}
            </select>
          </label>
        </div>
        <div
          class={errors?.get('code')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error relative my-2'
            : 'relative my-2'}
          data-tip={errors?.get('code') ?? ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('common.code')}
            </span>
            <textarea
              id="code"
              name="code"
              placeholder={$t('common.code')}
              class={`textarea transition border-2 normal-border join-item ${
                errors?.get('code') ? 'hover:textarea-error' : 'hover:textarea-secondary'
              } w-3/4 h-28`}
              bind:value={service.code}
              oninput={(e) => {
                patch = applyPatch(patch, 'replace', '/code', e.currentTarget.value);
              }}
            ></textarea>
          </label>
        </div>
        <div
          class={errors?.get('resourceId')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error relative my-2'
            : 'relative my-2'}
          data-tip={errors?.get('resourceId') ?? ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('service.resource_id')}{$t('common.optional')}
            </span>
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="resource_id"
              name="resourceId"
              placeholder={`${$t('service.resource_id')}${$t('common.optional')}`}
              class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                errors?.get('resourceId') ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={service.resourceId}
              oninput={(e) => {
                patch = applyPatch(patch, 'replace', '/resourceId', e.currentTarget.value);
              }}
            />
          </label>
          <div class="absolute right-2 inset-y-0 flex items-center">
            <button
              type="button"
              class="btn btn-sm {service.resourceId
                ? 'border-2 hover:btn-outline backdrop-blur'
                : 'btn-disabled'}"
              onclick={() => {
                service.resourceId = '';
                patch = applyPatch(patch, 'remove', '/resourceId');
              }}
            >
              {$t('common.empty_v')}
            </button>
          </div>
        </div>
        <div
          class={errors?.get('description')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error relative my-2'
            : 'relative my-2'}
          data-tip={errors?.get('description') ? errors?.get('description') : ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('common.description')}{$t('common.optional')}
            </span>
            <textarea
              id="description"
              name="description"
              placeholder={`${$t('common.description')}${$t('common.optional')}`}
              class={`textarea transition border-2 normal-border join-item ${
                errors?.get('description') ? 'hover:textarea-error' : 'hover:textarea-secondary'
              } w-3/4 h-28`}
              bind:value={service.description}
              oninput={(e) => {
                patch = applyPatch(patch, 'replace', '/description', e.currentTarget.value);
              }}
            ></textarea>
          </label>
          <button
            type="button"
            class="absolute right-2 bottom-2 btn btn-sm {service.description
              ? 'border-2 hover:btn-outline backdrop-blur'
              : 'btn-disabled'}"
            onclick={() => {
              service.description = '';
              patch = applyPatch(patch, 'remove', '/description');
            }}
          >
            {$t('common.empty_v')}
          </button>
        </div>
        <div
          class={errors?.get('Parameters')
            ? 'tooltip tooltip-open tooltip-right tooltip-error'
            : ''}
          data-tip={errors?.get('Parameters') ?? ''}
        >
          <label class="join my-2 w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('service.parameters')}
            </span>
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!newTag || service.parameters.includes(newTag)) return;
                  showTags = false;
                  service.parameters.push(newTag);
                  patch = applyPatch(patch, 'replace', '/parameters', service.parameters);
                  newTag = '';
                  setTimeout(() => {
                    showTags = true;
                  }, 0);
                }
              }}
              id="new_tag"
              class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                errors?.get('Parameters') ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newTag}
            />
            <button
              class="btn border-2 normal-border btn-outline btn-square hover:btn-secondary join-item"
              aria-label={$t('common.add')}
              onclick={(e) => {
                e.preventDefault();
                if (!newTag || service.parameters.includes(newTag)) return;
                showTags = false;
                service.parameters.push(newTag);
                patch = applyPatch(patch, 'replace', '/parameters', service.parameters);
                newTag = '';
                setTimeout(() => {
                  showTags = true;
                }, 0);
              }}
            >
              <i class="fa-solid fa-plus"></i>
            </button>
          </label>
        </div>
        {#if showTags}
          <div class="flex gap-1 flex-wrap">
            {#each service.parameters as tag, i}
              <Tag
                {tag}
                removeFunction={() => {
                  showTags = false;
                  service.parameters.splice(i, 1);
                  patch = applyPatch(patch, 'replace', '/parameters', service.parameters);
                  setTimeout(() => {
                    showTags = true;
                  }, 0);
                }}
              />
            {/each}
          </div>
        {/if}
        <div class="modal-action">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={status === Status.ERROR}
            data-tip={status === Status.ERROR
              ? ($t(`error.${errorCode}`) ?? $t('common.unknown_error'))
              : null}
          >
            <button
              type="submit"
              class="btn {status === Status.ERROR
                ? 'btn-error'
                : status === Status.SENDING
                  ? 'btn-ghost'
                  : 'btn-outline border-2 normal-border'} w-full"
              disabled={status === Status.SENDING}
              onclick={update}
            >
              {status === Status.ERROR
                ? $t('common.error')
                : status === Status.SENDING
                  ? $t('common.waiting')
                  : $t('common.submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="info-page">
    <div class="mx-auto lg:mx-4 sm:w-[60vw] w-full">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('service.service')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <h2 class="text-5xl py-1 flex gap-5 items-center font-bold">
              {service.name}
            </h2>
            <div class="flex gap-4 flex-col">
              <div class="info">
                <div class="form-control gap-1">
                  <p>
                    <span class="badge mr-1">{$t('service.target_type')}</span>
                    {$t(`service.target_types.${service.targetType}`)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.date_created')}
                    </span>
                    {parseDateTime(service.dateCreated, false, user?.language, true)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.date_updated')}
                    </span>
                    {parseDateTime(service.dateUpdated, false, user?.language, true)}
                  </p>
                  {#if service.description && service.description.length < 172}
                    <p class="content">
                      <span class="badge mr-1">
                        {$t('common.description')}
                      </span>
                      {service.description}
                    </p>
                  {/if}
                </div>
              </div>
              <div class="card-actions justify-end">
                <ServiceRequest {service} {resourcePath} {resourceId} class="text-lg w-32" />
                {#if user && getUserPrivilege(user.role) === 6}
                  <label
                    for="service-update-{service.id}"
                    class="btn border-2 normal-border btn-outline text-lg w-32"
                  >
                    {$t('common.edit')}
                  </label>
                  <Delete
                    id={service.id}
                    path="services"
                    name="service.service"
                    class="btn btn-square border-2 normal-border btn-outline text-lg"
                    onDelete={() => {
                      goto('/services');
                    }}
                  />
                {/if}
              </div>
            </div>
            {#if service.description && service.description.length >= 172}
              <p class="mt-2 content">
                <span class="badge mr-1">
                  {$t('common.description')}
                </span>
                {service.description}
              </p>
            {/if}
          </div>
        </div>
      </div>
      {#if service.code}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg z-10"
            style:--tw-translate-x="0"
          >
            {$t('common.code')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100 overflow-hidden"
          >
            {/* @ts-expect-error svelte-highlight does not support svelte 5 */ null}
            <Highlight language={csharp} code={service.code}>
              {#snippet children({ highlighted })}
                <LineNumbers {highlighted} hideBorder />
              {/snippet}
            </Highlight>
          </div>
        </div>
      {/if}
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/resource-records" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}

<style>
  .info {
    height: calc(100% - 48px);
  }
</style>
