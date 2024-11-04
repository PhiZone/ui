<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { invalidateAll } from '$app/navigation';
  import { t } from '$lib/translations/config';
  import type { PatchElement } from '$lib/api/types';
  import { Status } from '$lib/constants';
  import { applyPatch, getLevelDisplay, getUserPrivilege, parseDateTime } from '$lib/utils';
  import Delete from '$lib/components/Delete.svelte';
  import UpdateSuccess from '$lib/components/UpdateSuccess.svelte';
  import User from '$lib/components/User.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import type { ChartAssetDto } from '$lib/api/chart.asset';
  import Error from '$lib/components/Error.svelte';
  import Download from '$lib/components/Download.svelte';
  import AnonymizationNotice from '$lib/components/AnonymizationNotice.svelte';

  export let data;

  let patch = new Array<PatchElement>();
  let status = Status.WAITING;
  let errorCode = '';
  let updateErrors: Map<string, string> | undefined = undefined;
  let chartAssetDto: ChartAssetDto;

  $: ({ id, chartId, user, api, queryClient } = data);

  $: chart = createQuery(api.chart.info({ id: chartId }));
  $: chartAssetQuery = createQuery(api.chart.asset.info({ chartId, id }));
  $: content = createQuery({
    queryKey: ['chart-asset-content'],
    queryFn: async () => await (await fetch($chartAssetQuery.data?.data.file ?? '')).text(),
    enabled: $chartAssetQuery.isSuccess && $chartAssetQuery.data.data.type >= 3,
  });

  $: if (!chartAssetDto && $chartAssetQuery.isSuccess) {
    chartAssetDto = $chartAssetQuery.data.data;
  }

  const handleFile = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      status = Status.SENDING;
      errorCode = '';
      const resp = await api.chart.asset.updateFile({
        chartId,
        id,
        File: target.files[0],
      });
      if (resp.ok) {
        invalidateAll();
        await queryClient.invalidateQueries(['chart.asset.info', { id }]);
        status = Status.OK;
      } else {
        status = Status.ERROR;
        const data = await resp.json();
        errorCode = data.code;
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          data,
        );
      }
    }
  };

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    updateErrors = undefined;
    const resp = await api.chart.asset.update({ chartId, id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
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

<svelte:head>
  <title>
    {$t('chart.assets')} - {$chartAssetQuery.data?.data.name} | {$t('chart.chart')} -
    {$chart.isSuccess
      ? `${$chart.data.data.title ?? $chart.data.data.song.title} [${
          $chart.data.data.level
        } ${getLevelDisplay($chart.data.data.difficulty)}]`
      : ''} | {$t('common.site_name')}
  </title>
</svelte:head>

<UpdateSuccess checked={status === Status.OK} onClick={() => (status = Status.WAITING)} />

{#if $chartAssetQuery.isSuccess}
  {@const chartAsset = $chartAssetQuery.data.data}

  <input
    type="checkbox"
    id="chart-asset-update-{chartAsset.id}"
    class="modal-toggle"
    checked={status === Status.SENDING || status === Status.ERROR}
  />
  <div class="modal" role="dialog">
    <div class="modal-box min-w-[48vw]">
      <label
        for="chart-asset-update-{chartAsset.id}"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h3 class="font-bold text-lg mb-2">{$t('chart.asset.asset')}</h3>
      <form class="w-full form-control" on:submit|preventDefault>
        <div
          class={updateErrors?.get('File')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2 flex items-center'
            : 'my-2 flex items-center'}
          data-tip={updateErrors?.get('File') ?? ''}
        >
          <span class="w-32">{$t('chart.asset.file')}</span>
          <input
            type="file"
            id="file"
            name="File"
            class={`w-full file:mr-4 file:py-2 file:border-0 file:btn ${
              updateErrors?.get('File')
                ? 'input-error file:btn-error'
                : 'input-secondary file:btn-outline file:bg-secondary'
            }`}
            on:input={handleFile}
          />
        </div>
        <div
          class={updateErrors?.get('Name')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={updateErrors?.get('Name') ?? ''}
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
              bind:value={chartAssetDto.name}
              class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                updateErrors?.get('Name') ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              on:input={() => {
                patch = applyPatch(patch, 'replace', '/name', chartAssetDto.name);
              }}
            />
          </label>
        </div>
        <div
          class={updateErrors?.get('Type')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={updateErrors?.get('Type') ?? ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('common.type')}
            </span>
            <select
              id="type"
              name="Type"
              class={`select transition border-2 normal-border join-item w-3/4 ${
                updateErrors?.get('Type') ? 'hover:select-error' : 'hover:select-secondary'
              }`}
              value={chartAssetDto.type}
              on:input={(e) => {
                const type = parseInt(e.currentTarget.value);
                chartAssetDto.type = type;
                patch = applyPatch(patch, 'replace', '/type', chartAssetDto.type);
              }}
            >
              {#each [...Array(6).keys()] as i}
                <option value={i}>{$t(`chart.asset.types.${i}`)}</option>
              {/each}
            </select>
          </label>
        </div>
        <div class="modal-action">
          <div
            class="{status === Status.ERROR
              ? 'tooltip tooltip-open tooltip-left tooltip-error'
              : ''} max-w-fit"
            data-tip={errorCode ? $t(`error.${errorCode}`) : $t('common.unknown_error')}
          >
            <button
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

  <div class="studio-info-page">
    <div class="asset mx-auto lg:mx-4">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.asset.asset')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <h2 class="text-5xl py-1 flex gap-5 items-center font-bold break-all">
              {chartAsset.name}
            </h2>
            <div class="flex gap-4 flex-col md:flex-row">
              <div class="md:w-1/3 form-control gap-1">
                <p class="truncate flex items-center gap-1 grow-0">
                  <span class="badge">{$t('common.type')}</span>
                  <span>{$t(`chart.asset.types.${chartAsset.type}`)}</span>
                </p>
                <p class="truncate flex items-center gap-1 grow-0">
                  <span class="badge">
                    {$t('common.date_created')}
                  </span>
                  <span>{parseDateTime(chartAsset.dateCreated)}</span>
                </p>
                <p class="truncate flex items-center gap-1 grow-0">
                  <span class="badge">
                    {$t('common.date_updated')}
                  </span>
                  <span>{parseDateTime(chartAsset.dateUpdated)}</span>
                </p>
              </div>
              <div class="md:w-2/3 flex flex-col justify-between my-auto gap-2">
                {#if chartAsset.type === 0}
                  <img
                    src={chartAsset.file}
                    class="rounded-lg transition border-2 normal-border hover:shadow-lg"
                    alt="Asset Content"
                  />
                {:else if chartAsset.type === 1}
                  <audio src={chartAsset.file} class="w-full" controls />
                {:else if chartAsset.type === 2}
                  <!-- svelte-ignore a11y-media-has-caption -->
                  <video
                    src={chartAsset.file}
                    class="rounded-lg transition border-2 normal-border hover:shadow-lg"
                    controls
                  />
                {:else if $content.isSuccess}
                  <textarea
                    class="h-[50vh] textarea transition border-2 normal-border hover:shadow-lg text-lg font-code"
                    readonly
                    value={$content.data}
                  />
                {:else if $content.isLoading}
                  <div
                    class="skeleton h-[50vh] rounded-lg transition border-2 normal-border hover:shadow-lg"
                  />
                {/if}
                <div class="flex justify-end join">
                  <Download
                    file={chartAsset.file}
                    name={chartAsset.name.split('.').slice(0, -1).join('.')}
                    class="btn-md join-item"
                  />
                  {#if getUserPrivilege(user?.role) >= 6}
                    <label
                      for="chart-asset-update-{chartAsset.id}"
                      class="btn btn-ghost border-2 hover:btn-outline w-fit join-item"
                    >
                      <i class="fa-solid fa-edit fa-lg"></i>
                      {$t('common.edit')}
                    </label>
                    <Delete
                      id={chartAsset.id}
                      path="studio/charts/{chartId}/assets"
                      name="chart.asset.asset"
                      class="btn-ghost border-2 hover:btn-outline w-fit join-item"
                      hasText
                    />
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mx-auto lg:mx-4 w-80 form-control">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('common.owner')}
        </span>
        {#if chartAsset.ownerId}
          <User id={chartAsset.ownerId} />
        {:else}
          <AnonymizationNotice />
        {/if}
      </div>
      {#if $chart.isSuccess}
        {@const chart = $chart.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.chart')}
          </span>
          <Chart {chart} />
        </div>
      {/if}
    </div>
  </div>
{:else if $chartAssetQuery.isError}
  <Error error={$chartAssetQuery.error} back="/charts/{chartId}/assets" />
{:else}
  <div class="min-h-page skeleton" />
{/if}

<style>
  @media (min-width: 1024px) {
    .asset {
      width: calc(100% - 300px);
    }
  }

  .asset {
    width: 100%;
  }
</style>
