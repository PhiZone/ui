<script lang="ts">
  import { page } from '$app/stores';
  import type { ChartAssetDto } from '$lib/api/chart.asset';
  import type { ChartAssetSubmissionDto } from '$lib/api/chart.submission.asset';
  import { t } from '$lib/translations/config';
  import { createQuery } from '@tanstack/svelte-query';

  $: ({ api } = $page.data);

  export let chartAsset: ChartAssetDto | ChartAssetSubmissionDto;

  $: owner = createQuery(api.user.info({ id: chartAsset.ownerId }));
</script>

<a
  class="card w-[288px] h-40 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
  href="/{'chartId' in chartAsset ? 'charts' : 'studio/chart-submissions'}/{'chartId' in chartAsset
    ? chartAsset.chartId
    : chartAsset.chartSubmissionId}/assets/{chartAsset.id}"
>
  {#if chartAsset.type === 0}
    <img
      src={chartAsset.file}
      alt="Asset Content"
      class="absolute border-0 left-0 right-0 top-0 bottom-0 m-auto p-2 w-full h-full object-contain opacity-60"
    />
  {/if}
  <div class="card-body gap-0.5 z-10">
    <h2 class="card-title mb-1">{chartAsset.name}</h2>
    <p class="flex items-center gap-1">
      <span class="badge">{$t('chart.asset.type')}</span>
      <span class="whitespace-nowrap overflow-hidden text-ellipsis">
        {$t(`chart.asset.types.${chartAsset.type}`)}
      </span>
    </p>
    <p class="flex items-center gap-1">
      <span class="badge">{$t('chart.owner')}</span>
      {#if $owner.isSuccess}
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">
          {$owner.data.data.userName}
        </span>
      {:else}
        <span class="skeleton w-2/3 h-6"></span>
      {/if}
    </p>
  </div>
</a>
