<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import Highlight, { LineNumbers } from 'svelte-highlight';
  import csharp from 'svelte-highlight/languages/csharp';
  import darkTheme from 'svelte-highlight/styles/unikitty-dark';
  import lightTheme from 'svelte-highlight/styles/unikitty-light';

  import type { EventTaskDto } from '$lib/api/event';
  import type { PatchElement } from '$lib/api/types';

  import { browser } from '$app/environment';
  import { goto, invalidateAll } from '$app/navigation';
  import Delete from '$lib/components/Delete.svelte';
  import Error from '$lib/components/Error.svelte';
  import UpdateSuccess from '$lib/components/UpdateSuccess.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { applyPatch, hasEventPermission, parseDateTime } from '$lib/utils';

  export let data;

  $: ({ user, id, divisionId, api } = data);

  $: options = api.event.task.info({ id });
  $: query = createQuery({ ...options });
  $: division = createQuery(api.event.division.info({ id: divisionId }));
  $: event = createQuery(
    api.event.info({ id: $division.data?.data.eventId ?? '' }, { enabled: $division.isSuccess }),
  );

  const queryClient = useQueryClient();

  let task: EventTaskDto;
  let status = Status.WAITING;
  let errorCode = '';
  let errors: Map<string, string> | undefined = undefined;
  let patch = new Array<PatchElement>();

  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let day = new Date().getDate();
  let hour = new Date().getHours();
  let minute = new Date().getMinutes();
  let second = new Date().getSeconds();

  const handleDateExecuted = () => {
    const date = new Date(year, month - 1, day, hour, minute, second);
    task.dateExecuted = date.toISOString();
    patch = applyPatch(patch, 'replace', '/dateExecuted', task.dateExecuted);
  };

  const prefersDarkColorScheme = () =>
    browser &&
    window &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    errors = undefined;
    const resp = await api.event.task.update({ id }, patch);
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

  $: if (!task && $query.isSuccess) {
    task = $query.data.data;
    if (task.dateExecuted) {
      const date = new Date(task.dateExecuted);
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
      hour = date.getHours();
      minute = date.getMinutes();
      second = date.getSeconds();
    }
  }
</script>

<svelte:head>
  <title>
    {$t('event.task.task')} - {$query.data?.data.name} | {$t('event.event')} - {$event.data?.data
      .title} ({$division.data?.data.title}) | {$t('common.site_name')}
  </title>
  {#if prefersDarkColorScheme()}
    {@html darkTheme}
  {:else}
    {@html lightTheme}
  {/if}
</svelte:head>
<UpdateSuccess checked={status === Status.OK} onClick={() => (status = Status.WAITING)} />

{#if $query.isSuccess}
  <input
    type="checkbox"
    id="task-update-{task.id}"
    class="modal-toggle"
    checked={status === Status.SENDING || status === Status.ERROR}
  />
  <div class="modal" role="dialog">
    <div class="modal-box min-w-[60vw]">
      <label
        for="task-update-{task.id}"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h3 class="font-bold text-lg mb-2">{$t('event.task.task')}</h3>
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
              on:keydown={(e) => {
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
              bind:value={task.name}
              on:input={(e) => {
                patch = applyPatch(patch, 'replace', '/name', e.currentTarget.value);
              }}
            />
          </label>
        </div>
        <div
          class={errors?.get('type')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={errors?.get('type') ?? ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('common.type')}
            </span>
            <select
              id="type"
              name="type"
              class={`select transition border-2 normal-border join-item w-3/4 ${
                errors?.get('type') ? 'hover:select-error' : 'hover:select-secondary'
              }`}
              value={task.type}
              on:input={(e) => {
                task.type = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/type', task.type);
              }}
            >
              {#each [...Array(21).keys()] as i}
                <option value={i}>{$t(`event.task.types.${i}`)}</option>
              {/each}
            </select>
          </label>
        </div>
        {#if task.type === 0}
          <div
            class={errors?.get('dateExecuted')
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
              : 'my-2'}
            data-tip={errors?.get('dateExecuted') ?? ''}
          >
            <label class="join w-full">
              <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                {$t('event.task.date_executed')}
              </span>
              <div class="join w-3/4">
                <select
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/6"
                  on:input={(e) => {
                    year = parseInt(e.currentTarget.value);
                    handleDateExecuted();
                  }}
                >
                  {#each Array.from({ length: 2 }, (_, i) => new Date().getUTCFullYear() + i) as y}
                    <option value={y} selected={y == year}>
                      {y}
                    </option>
                  {/each}
                </select>
                <select
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/6"
                  on:input={(e) => {
                    month = parseInt(e.currentTarget.value);
                    handleDateExecuted();
                  }}
                >
                  {#each Array.from({ length: 12 }, (_, i) => i + 1) as m}
                    <option value={m} selected={m == month}>
                      {m}
                    </option>
                  {/each}
                </select>
                <select
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/6"
                  on:input={(e) => {
                    day = parseInt(e.currentTarget.value);
                    handleDateExecuted();
                  }}
                >
                  {#each Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1) as d}
                    <option value={d} selected={d == day}>
                      {d}
                    </option>
                  {/each}
                </select>
                <select
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/6"
                  on:input={(e) => {
                    hour = parseInt(e.currentTarget.value);
                    handleDateExecuted();
                  }}
                >
                  {#each Array(24).keys() as h}
                    <option value={h} selected={h == hour}>
                      {h}
                    </option>
                  {/each}
                </select>
                <select
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/6"
                  on:input={(e) => {
                    minute = parseInt(e.currentTarget.value);
                    handleDateExecuted();
                  }}
                >
                  {#each Array(60).keys() as m}
                    <option value={m} selected={m == minute}>
                      {m}
                    </option>
                  {/each}
                </select>
                <select
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/6"
                  on:input={(e) => {
                    second = parseInt(e.currentTarget.value);
                    handleDateExecuted();
                  }}
                >
                  {#each Array(60).keys() as s}
                    <option value={s} selected={s == second}>
                      {s}
                    </option>
                  {/each}
                </select>
              </div>
            </label>
          </div>
        {/if}
        <div
          class={errors?.get('description')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error relative my-2'
            : 'relative my-2'}
          data-tip={errors?.get('description') ? errors?.get('description') : ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('common.description')}
            </span>
            <textarea
              id="description"
              name="description"
              placeholder={$t('common.description')}
              class={`textarea transition border-2 normal-border join-item ${
                errors?.get('description') ? 'hover:textarea-error' : 'hover:textarea-secondary'
              } w-3/4 h-28`}
              bind:value={task.description}
              on:input={(e) => {
                patch = applyPatch(patch, 'replace', '/description', e.currentTarget.value);
              }}
            ></textarea>
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
              {$t('common.code')}{$t('common.optional')}
            </span>
            <textarea
              id="code"
              name="code"
              placeholder={`${$t('common.code')}${$t('common.optional')}`}
              class={`textarea transition border-2 normal-border join-item ${
                errors?.get('code') ? 'hover:textarea-error' : 'hover:textarea-secondary'
              } w-3/4 h-28`}
              bind:value={task.code}
              on:input={(e) => {
                patch = applyPatch(patch, 'replace', '/code', e.currentTarget.value);
              }}
            ></textarea>
          </label>
          <button
            type="button"
            class="absolute right-2 bottom-2 btn btn-sm {task.code
              ? 'border-2 hover:btn-outline backdrop-blur'
              : 'btn-disabled'}"
            on:click={() => {
              task.code = '';
              patch = applyPatch(patch, 'remove', '/code');
            }}
          >
            {$t('common.empty_v')}
          </button>
        </div>
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
              on:click={update}
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
          {$t('event.task.task')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <h2 class="text-5xl py-1 flex gap-5 items-center font-bold">
              {task.name}
            </h2>
            <div class="flex gap-4 flex-col">
              <div class="info">
                <div class="form-control gap-1">
                  <p>
                    <span class="badge mr-1">{$t('common.type')}</span>
                    {$t(`event.task.types.${task.type}`)}
                  </p>
                  {#if task.type === 0 && task.dateExecuted}
                    <p>
                      <span class="badge mr-1">
                        {$t('event.task.date_executed')}
                      </span>
                      {parseDateTime(task.dateExecuted, false, user?.language, true)}
                    </p>
                  {/if}
                  <p>
                    <span class="badge mr-1">
                      {$t('common.date_created')}
                    </span>
                    {parseDateTime(task.dateCreated, false, user?.language, true)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.date_updated')}
                    </span>
                    {parseDateTime(task.dateUpdated, false, user?.language, true)}
                  </p>
                  {#if task.description && task.description.length < 172}
                    <p class="content">
                      <span class="badge mr-1">
                        {$t('common.description')}
                      </span>
                      {task.description}
                    </p>
                  {/if}
                </div>
              </div>
              {#if hasEventPermission(user, $event.data?.data)}
                <div class="card-actions justify-end">
                  <label
                    for="task-update-{task.id}"
                    class="btn border-2 normal-border btn-outline text-lg w-32"
                  >
                    {$t('common.edit')}
                  </label>
                  <Delete
                    id={task.id}
                    path="events/tasks"
                    name="event.task.task"
                    class="btn btn-square border-2 normal-border btn-outline text-lg"
                    onDelete={() => {
                      goto(`/events/divisions/${divisionId}/tasks`);
                    }}
                  />
                </div>
              {/if}
            </div>
            {#if task.description && task.description.length >= 172}
              <p class="mt-2 content">
                <span class="badge mr-1">
                  {$t('common.description')}
                </span>
                {task.description}
              </p>
            {/if}
          </div>
        </div>
      </div>
      {#if task.code}
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
            <Highlight language={csharp} code={task.code} let:highlighted>
              <LineNumbers {highlighted} hideBorder />
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
