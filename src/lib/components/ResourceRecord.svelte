<script lang="ts">
  import type { ResourceRecordDto } from '$lib/api/resourceRecord';

  import { t } from '$lib/translations/config';

  interface Props {
    resourceRecord: ResourceRecordDto;
    target?: '_self' | '_blank';
  }
  let { resourceRecord, target = '_self' }: Props = $props();
</script>

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a href={`/resource-records/${resourceRecord.id}`} {target}>
    <div class="card-body py-6 gap-0.5">
      {#if resourceRecord.strategy === 0}
        <div
          class="tooltip tooltip-left tooltip-success absolute top-6 right-6"
          data-tip={$t('resource_record.strategies.0')}
        >
          <div class="btn btn-xs btn-circle btn-success no-animation">
            <i class="fa-solid fa-check"></i>
          </div>
        </div>
      {:else if resourceRecord.strategy === 4}
        <div
          class="tooltip tooltip-left tooltip-error absolute top-6 right-6"
          data-tip={$t('resource_record.strategies.4')}
        >
          <div class="btn btn-xs btn-circle btn-error no-animation">
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
      {:else}
        <div
          class="tooltip tooltip-left tooltip-warning absolute top-6 right-6"
          data-tip={$t(`resource_record.strategies.${resourceRecord.strategy}`)}
        >
          <div class="btn btn-xs btn-circle btn-warning no-animation">
            <i class="fa-solid fa-exclamation"></i>
          </div>
        </div>
      {/if}
      <h2 class="title mb-1 truncate max-w-[220px]">
        {resourceRecord.title}
      </h2>
      <p class="truncate">
        <span class="badge mr-1">{$t('common.type')}</span>
        {$t(`resource_record.types.${resourceRecord.type}`)}
      </p>
      <p class="truncate">
        <span class="badge mr-1">{$t('resource_record.edition')}</span>
        {resourceRecord.edition ??
          $t(`resource_record.edition_types.${resourceRecord.editionType}`)}
      </p>
      <p class="truncate">
        <span class="badge mr-1">{$t('resource_record.author')}</span>
        {resourceRecord.authorName}
      </p>
      <p class="truncate">
        <span class="badge mr-1">{$t('resource_record.copyright_owner')}</span>
        {resourceRecord.copyrightOwner}
      </p>
    </div>
  </a>
</div>
