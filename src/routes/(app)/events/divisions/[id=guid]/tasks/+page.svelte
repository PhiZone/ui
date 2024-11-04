<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import EventTask from '$lib/components/EventTask.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { hasEventPermission } from '$lib/utils';
  import Error from '$lib/components/Error.svelte';

  export let data;

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  $: ({ searchParams, page, user, id, api } = data);

  let type = 0;

  $: query = createQuery(api.event.task.list(searchParams));
  $: division = createQuery(api.event.division.info({ id }));
  $: event = createQuery(
    api.event.info({ id: $division.data?.data.eventId ?? '' }, { enabled: $division.isSuccess }),
  );

  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;
  let day = new Date().getDate();
  let hour = new Date().getHours();
  let minute = new Date().getMinutes();
  let second = new Date().getSeconds();
  let dateExecuted = new Date().toISOString();

  const handleDateExecuted = () => {
    const date = new Date(year, month - 1, day, hour, minute, second);
    dateExecuted = date.toISOString();
  };
</script>

<svelte:head>
  <title>
    {$t('event.tasks')} | {$t('event.event')} - {$event.data?.data.title} ({$division.data?.data
      .title}) | {$t('common.site_name')}
  </title>
</svelte:head>

<input
  type="checkbox"
  id="task-add"
  class="modal-toggle"
  checked={$submitting || $allErrors.length > 0}
/>
<div class="modal" role="dialog">
  <div class="modal-box min-w-[60vw]">
    <label
      for="task-add"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('common.add')}</h3>
    <form method="POST" class="w-full form-control" use:enhance>
      <input type="hidden" id="division_id" name="divisionId" value={id} />
      <div
        class={$errors.name ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.name ?? ''}
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
              $errors.name ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.type ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.type ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.type')}
          </span>
          <select
            id="type"
            name="type"
            class={`select transition border-2 normal-border join-item w-3/4 ${
              $errors.type ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            bind:value={type}
          >
            {#each [...Array(21).keys()] as i}
              <option value={i}>{$t(`event.task.types.${i}`)}</option>
            {/each}
          </select>
        </label>
      </div>
      {#if type === 0}
        <input type="hidden" id="date_executed" name="dateExecuted" value={dateExecuted} />
        <div
          class={$errors.dateExecuted
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={$errors.dateExecuted ?? ''}
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
        class={$errors.description
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.description ? $errors.description : ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.description')}
          </span>
          <textarea
            id="description"
            name="description"
            class={`textarea transition border-2 normal-border join-item ${
              $errors.description ? 'hover:textarea-error' : 'hover:textarea-secondary'
            } w-3/4 h-28`}
            placeholder={$t('common.description')}
          />
        </label>
      </div>
      <div
        class={$errors.code ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.code ?? ''}
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
              $errors.code ? 'hover:textarea-error' : 'hover:textarea-secondary'
            } w-3/4 h-28`}
          />
        </label>
      </div>
      <div class="modal-action">
        <div
          class="{$message ? 'tooltip tooltip-open tooltip-left tooltip-error' : ''} max-w-fit"
          data-tip={$message}
        >
          <button
            type="submit"
            class="btn {$allErrors.length > 0
              ? 'btn-error'
              : $submitting
                ? 'btn-ghost'
                : 'btn-outline border-2 normal-border'} w-full"
            disabled={$submitting}
          >
            {$allErrors.length > 0
              ? $t('common.error')
              : $submitting
                ? $t('common.waiting')
                : $t('common.submit')}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <div class="flex gap-2 justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">{$t('event.tasks')}</h1>
      <div class="join">
        {#if hasEventPermission(user, $event.data?.data)}
          <label for="task-add" class="btn border-2 normal-border hover:btn-outline join-item">
            {$t('common.add')}
          </label>
        {/if}
        <a
          href="/events/divisions/{id}"
          class="btn border-2 normal-border hover:btn-outline join-item"
        >
          {$t('common.back')}
        </a>
      </div>
    </div>
    {#if total && perPage && data.length > 0}
      <div class="result">
        {#each data as task}
          <div class="min-w-fit">
            <EventTask {task} />
          </div>
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton" />
{/if}
