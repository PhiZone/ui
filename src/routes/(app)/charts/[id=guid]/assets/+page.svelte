<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import ChartAsset from '$lib/components/ChartAsset.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { getLevelDisplay, getUserPrivilege } from '$lib/utils';
  import Error from '$lib/components/Error.svelte';

  export let data;

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form, {
    onResult({ result }) {
      if (result.type == 'success') {
        modalOpen = false;
      }
    },
  });

  $: ({ searchParams, page, user, api, params } = data);

  let name = '';
  let type = 5;
  let fileInput: HTMLInputElement;
  let file: File | null = null;
  let modalOpen = false;

  $: chart = createQuery(api.chart.info({ id: params.id }));
  $: query = createQuery(api.chart.asset.list({ ...searchParams, chartId: params.id }));

  const getFileType = (mime: string, fileName: string) => {
    const extension = fileName.split('.').pop() ?? '';
    if (mime.startsWith('image/')) {
      return 0;
    } else if (mime.startsWith('audio/')) {
      return 1;
    } else if (mime.startsWith('video/')) {
      return 2;
    } else if (
      mime.startsWith('text/') ||
      mime == 'application/json' ||
      ['yml', 'yaml'].includes(extension)
    ) {
      return 3;
    } else {
      return 5;
    }
  };

  const resolveFile = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      file = target.files[0];
      name = file.name;
      type = getFileType(file.type, file.name);
      modalOpen = true;
    }
  };
</script>

<svelte:head>
  <title>
    {$t('chart.assets')} | {$t('chart.chart')} -
    {$chart.isSuccess
      ? `${$chart.data.data.title ?? $chart.data.data.song.title} [${
          $chart.data.data.level
        } ${getLevelDisplay($chart.data.data.difficulty)}]`
      : ''} | {$t('common.title')}
  </title>
</svelte:head>

<input type="checkbox" id="chart-asset-add" class="modal-toggle" bind:checked={modalOpen} />
<div class="modal" role="dialog">
  <div class="modal-box min-w-[48vw]">
    <label
      for="chart-asset-add"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('common.add')}</h3>
    <form method="POST" class="w-full form-control" enctype="multipart/form-data" use:enhance>
      <div
        class={$errors.File
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2 flex items-center'
          : 'my-2 flex items-center'}
        data-tip={$errors.File ?? ''}
      >
        <span class="w-32">{$t('chart.asset.file')}</span>
        <input
          type="file"
          id="file"
          name="File"
          bind:this={fileInput}
          class={`w-full file:mr-4 file:py-2 file:border-0 file:btn ${
            $errors.File
              ? 'input-error file:btn-error'
              : 'input-secondary file:btn-outline file:bg-secondary'
          }`}
          on:input={resolveFile}
        />
      </div>
      <div
        class={$errors.Name ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.Name ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('chart.asset.name')}
          </span>
          <input
            type="text"
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="name"
            name="Name"
            placeholder={$t('chart.asset.name')}
            bind:value={name}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.Name ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.Type ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.Type ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.type')}
          </span>
          <select
            id="type"
            name="Type"
            class={`select transition border-2 normal-border join-item w-3/4 ${
              $errors.Type ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            bind:value={type}
          >
            {#each [...Array(6).keys()] as i}
              <option value={i}>{$t(`chart.asset.types.${i}`)}</option>
            {/each}
          </select>
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
      <h1 class="text-4xl font-bold">{$t('chart.assets')}</h1>
      <div class="join">
        {#if getUserPrivilege(user?.role) >= 6}
          <button
            class="btn border-2 normal-border hover:btn-outline join-item"
            on:click={() => {
              fileInput.click();
            }}
          >
            {$t('common.add')}
          </button>
        {/if}
        <a
          href="/charts/{params.id}"
          class="btn border-2 normal-border hover:btn-outline join-item"
        >
          {$t('common.back')}
        </a>
      </div>
    </div>
    {#if total && perPage && data.length > 0}
      <div class="result">
        {#each data as chartAsset}
          <div class="min-w-fit">
            <ChartAsset {chartAsset} />
          </div>
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/charts" />
{:else}
  <div class="min-h-page skeleton" />
{/if}
