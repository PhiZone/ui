<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Error from '$lib/components/Error.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { getLevelDisplay, hasEventPermission } from '$lib/utils.js';
  import { CREATE, REMOVE, RESOURCE } from '$lib/hostshipPermissions';
  import Delete from '$lib/components/Delete.svelte';

  export let data;
  $: ({ user, id, searchParams, page, api } = data);

  const {
    enhance: resourceEnhance,
    errors: resourceErrors,
    message: resourceMessage,
    submitting: resourceSubmitting,
    allErrors: resourceAllErrors,
  } = superForm(data.resourceForm, {
    id: 'chart-resource',
    onResult({ result }) {
      if (result.type == 'success') {
        resourceOpen = false;
      }
    },
  });

  let queryResource = true;
  let newResourceSearch: string;
  let newResourceId: string | null = null;
  let resourceOpen = false;

  $: division = createQuery(api.event.division.info({ id }));
  $: if (browser && $division.isSuccess && $division.data.data.type == 0) {
    goto(`/events/divisions/${id}`);
  }
  $: event = createQuery(
    api.event.info({ id: $division.data?.data.eventId ?? '' }, { enabled: $division.isSuccess }),
  );
  $: songPrompts = createQuery(
    api.event.division.listSongPrompts(
      { id },
      { enabled: $division.isSuccess && $division.data.data.type == 1 },
    ),
  );
  $: chartPrompts = createQuery(
    api.event.division.listChartPrompts(
      { id },
      { enabled: $division.isSuccess && $division.data.data.type == 2 },
    ),
  );
  $: songSearch = createQuery(
    api.song.listAll(
      { search: newResourceSearch ?? undefined },
      { enabled: queryResource && $division.isSuccess && $division.data.data.type == 1 },
    ),
  );
  $: chartSearch = createQuery(
    api.chart.listAll(
      { search: newResourceSearch ?? undefined },
      { enabled: queryResource && $division.isSuccess && $division.data.data.type == 2 },
    ),
  );
</script>

<svelte:head>
  <title>
    {$t($division.data?.data.type == 2 ? 'event.division.chart_pool' : 'event.division.song_pool')} |
    {$t('event.event')} - {$event.data?.data.title} ({$division.data?.data.title}) | {$t(
      'common.title',
    )}
  </title>
</svelte:head>

{#if $division.isSuccess && $event.isSuccess && (($division.data.data.type == 1 && $songPrompts.isSuccess) || ($division.data.data.type == 2 && $chartPrompts.isSuccess))}
  {@const division = $division.data.data}
  {@const event = $event.data.data}
  <input type="checkbox" id="new-resource" class="modal-toggle" bind:checked={resourceOpen} />
  <div class="modal">
    <div class="modal-box bg-base-100 form-control gap-3 min-w-[40vw]">
      <h3 class="font-bold text-lg">{$t('common.add')}</h3>
      <label
        for="new-resource"
        class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="resource"
        method="POST"
        class="w-full form-control gap-4"
        action="?/resource"
        use:resourceEnhance
      >
        <input type="hidden" id="division_id" name="divisionId" value={division.id} />
        {#if division.type === 1}
          <input type="hidden" id="resource_type" name="resourceType" value="songs" />
          <div
            class={$songSearch.isError
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full'
              : 'w-full'}
            data-tip={$songSearch.isError ? $t(`error.${$songSearch.error.code}`) : ''}
          >
            <label class="join w-full">
              <input
                type="text"
                placeholder={$t('common.search_placeholder', {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  resource: $t('common.songs'),
                })}
                class={`input transition border-2 normal-border w-5/6 join-item min-w-[180px] ${
                  $songSearch.isError ? 'hover:input-error' : 'hover:input-secondary'
                }`}
                bind:value={newResourceSearch}
                on:input={() => {
                  queryResource = false;
                }}
              />
              <button
                type="button"
                class={`btn border-2 normal-border w-1/6 join-item ${
                  $songSearch.isLoading
                    ? $songSearch.isError
                      ? 'btn-error'
                      : 'hover:btn-secondary btn-outline'
                    : 'btn-disabled'
                }`}
                on:click={() => {
                  queryResource = true;
                }}
              >
                <i class="fa-solid fa-magnifying-glass fa-lg"></i>
              </button>
            </label>
          </div>
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.songs')}
            </span>
            <select
              id="id"
              name="id"
              class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
              bind:value={newResourceId}
            >
              {#if $songSearch.isSuccess}
                {#each $songSearch.data.data as resource}
                  {@const composerText =
                    resource.isOriginal && resource.authorName
                      ? resource.authorName.replaceAll(
                          /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
                          (_, __, ___, display) => display,
                        )
                      : resource.authorName}
                  {#if [0, 1].includes(resource.accessibility) || (user && resource.ownerId === user.id)}
                    <option value={resource.id}>
                      {`${composerText} - ${resource.title}${
                        resource.edition ? ` (${resource.edition})` : ''
                      }`}
                    </option>
                  {/if}
                {/each}
              {/if}
            </select>
          </label>
        {:else if division.type === 2}
          <input type="hidden" id="resource_type" name="resourceType" value="charts" />
          <div
            class={$chartSearch.isError
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full'
              : 'w-full'}
            data-tip={$chartSearch.isError ? $t(`error.${$chartSearch.error.code}`) : ''}
          >
            <label class="join w-full">
              <input
                type="text"
                placeholder={$t('common.search_placeholder', {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  resource: $t('common.charts'),
                })}
                class={`input transition border-2 normal-border w-5/6 join-item min-w-[180px] ${
                  $chartSearch.isError ? 'hover:input-error' : 'hover:input-secondary'
                }`}
                bind:value={newResourceSearch}
                on:input={() => {
                  queryResource = false;
                }}
              />
              <button
                type="button"
                class={`btn border-2 normal-border w-1/6 join-item ${
                  $chartSearch.isLoading
                    ? $chartSearch.isError
                      ? 'btn-error'
                      : 'hover:btn-secondary btn-outline'
                    : 'btn-disabled'
                }`}
                on:click={() => {
                  queryResource = true;
                }}
              >
                <i class="fa-solid fa-magnifying-glass fa-lg"></i>
              </button>
            </label>
          </div>
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.charts')}
            </span>
            <select
              id="id"
              name="id"
              class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
              bind:value={newResourceId}
            >
              {#if $chartSearch.isSuccess}
                {#each $chartSearch.data.data as resource}
                  {@const composerText =
                    resource.song.isOriginal && resource.song.authorName
                      ? resource.song.authorName.replaceAll(
                          /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
                          (_, __, ___, display) => display,
                        )
                      : resource.song.authorName}
                  {#if [0, 1].includes(resource.accessibility) || (user && resource.ownerId === user.id)}
                    <option value={resource.id}>
                      {`${composerText} - ${resource.title ?? resource.song.title}${
                        resource.song.edition ? ` (${resource.song.edition})` : ''
                      }[${resource.level} ${getLevelDisplay(resource.difficulty)}]`}
                    </option>
                  {/if}
                {/each}
              {/if}
            </select>
          </label>
        {/if}
        <div
          class={$resourceErrors.label ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$resourceErrors.label}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.label')}
            </span>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={$t('common.label')}
              class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
            />
          </label>
        </div>
        <div
          class={$resourceErrors.description
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={$resourceErrors.description}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.description')}
            </span>
            <textarea
              id="description"
              name="description"
              placeholder={$t('common.description')}
              class="textarea transition border-2 normal-border hover:textarea-secondary join-item w-3/4 h-24"
            />
          </label>
        </div>
        <div class="modal-action mt-3">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={!!$resourceMessage}
            data-tip={$resourceMessage}
          >
            <button
              type="submit"
              class="btn {$resourceAllErrors.length > 0
                ? 'btn-error'
                : $resourceSubmitting
                  ? 'btn-ghost'
                  : 'btn-outline border-2 normal-border'} w-full"
              disabled={$resourceSubmitting}
            >
              {$resourceAllErrors.length > 0
                ? $t('common.error')
                : $resourceSubmitting
                  ? $t('common.waiting')
                  : $t('common.submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="page">
    <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
      <a class="transition hover:text-accent" href="/events/{event.id}">{event.title}</a>
      /
      <a class="transition hover:text-accent" href="/events/divisions/{division.id}">
        {division.title}
      </a>
    </h1>
    {#if division.type == 1 && $songPrompts.isSuccess}
      <div class="flex gap-2 justify-between items-center mt-3 mb-6">
        <h1 class="text-4xl font-bold">{$t('event.division.song_pool')}</h1>
        {#if hasEventPermission(user, event, CREATE, RESOURCE)}
          <label for="new-resource" class="btn border-2 normal-border hover:btn-outline join-item">
            {$t('common.add')}
          </label>
        {/if}
      </div>
      {@const { total, perPage, data } = $songPrompts.data}
      {#if total && perPage && data && data.length > 0}
        <div class="result">
          {#if hasEventPermission(user, event, REMOVE, RESOURCE)}
            {#each data as song}
              <div class="dropdown dropdown-hover dropdown-right float-right">
                <Song {song} />
                <div
                  tabindex="-1"
                  class="dropdown-content menu p-2 shadow bg-base-100 bg-opacity-50 backdrop-blur rounded-box z-10"
                >
                  <Delete
                    id="{division.id}/{song.id}"
                    path="events/resources"
                    class="btn-sm btn-square"
                  />
                </div>
              </div>
            {/each}
          {:else}
            {#each data as song}
              <Song {song} />
            {/each}
          {/if}
        </div>
        <Paginator {total} {perPage} {page} {searchParams} />
      {:else}
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {/if}
    {#if division.type == 2 && $chartPrompts.isSuccess}
      <h1 class="text-4xl font-bold mt-3 mb-6">{$t('event.division.chart_pool')}</h1>
      {@const { total, perPage, data } = $chartPrompts.data}
      {#if total && perPage && data && data.length > 0}
        <div class="result">
          {#if hasEventPermission(user, event, REMOVE, RESOURCE)}
            {#each data as chart}
              <div class="dropdown dropdown-hover dropdown-right float-right">
                <Chart {chart} />
                <div
                  tabindex="-1"
                  class="dropdown-content menu p-2 shadow bg-base-200 rounded-box z-10"
                >
                  <Delete
                    id="{division.id}/{chart.id}"
                    path="events/resources"
                    class="btn-sm btn-square"
                  />
                </div>
              </div>
            {/each}
          {:else}
            {#each data as chart}
              <Chart {chart} />
            {/each}
          {/if}
        </div>
        <Paginator {total} {perPage} {page} {searchParams} />
      {:else}
        <p class="py-3 text-center">{$t('common.empty')}</p>
      {/if}
    {/if}
  </div>
{:else if $division.isError}
  <Error error={$division.error} />
{:else}
  <div class="min-h-page skeleton" />
{/if}
