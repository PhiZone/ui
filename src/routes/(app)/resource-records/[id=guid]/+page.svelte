<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  import Error from '$lib/components/Error.svelte';

  export let data;

  $: ({ id, api } = data);

  $: resourceRecord = createQuery(api.resourceRecord.info({ id }));
</script>

<svelte:head>
  <title>
    {$t('resource_record.resource_record')} - {$resourceRecord.data?.data.title} | {$t(
      'common.title',
    )}
  </title>
</svelte:head>

{#if $resourceRecord.isSuccess}
  {@const resourceRecord = $resourceRecord.data.data}

  <input type="checkbox" id="license-{resourceRecord.id}" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box text-left min-w-fit">
      <label
        for="license-{resourceRecord.id}"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="text-5xl py-3 flex font-bold items-center content">
        {resourceRecord.title}
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-accent btn-sm text-xl no-animation">
          {$t(`resource_record.edition_types.${resourceRecord.editionType}`)}
        </button>
        {#if resourceRecord.edition}
          <p class="text-2xl font-semibold">
            {resourceRecord.edition}
          </p>
        {/if}
      </div>
      <p class="py-4">
        {$t(`resource_record.edition_type_tips.${resourceRecord.editionType}`)}
      </p>
    </div>
  </div>

  <div class="info-page">
    <div class="mx-auto lg:mx-4 min-w-fit w-[40vw]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('resource_record.resource_record')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <h2 class="text-5xl py-1 flex gap-5 items-center font-bold">
              {resourceRecord.title}
            </h2>
            <div class="flex gap-4 flex-col">
              <div class="info">
                <div class="form-control gap-1">
                  <!-- <p>
                      <span class="badge mr-1">{$t('resource_record.id')}</span>
                      {resourceRecord.id}
                    </p> -->
                  <p>
                    <span class="badge mr-1">{$t('resource_record.type')}</span>
                    {$t(`resource_record.types.${resourceRecord.type}`)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('resource_record.edition')}
                    </span>
                    <label
                      for="license-{resourceRecord.id}"
                      class="btn btn-xs btn-shallow text-sm font-normal"
                    >
                      {$t(`resource_record.edition_types.${resourceRecord.editionType}`)}
                    </label>
                    {#if resourceRecord.edition}
                      {resourceRecord.edition}
                    {/if}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('resource_record.author')}
                    </span>
                    {resourceRecord.authorName}
                  </p>
                  <p>
                    <span class="badge mr-1">{$t('resource_record.strategy')}</span>
                    {$t(`resource_record.strategies.${resourceRecord.strategy}`)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('resource_record.copyright_owner')}
                    </span>
                    {resourceRecord.copyrightOwner}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.created_at')}
                    </span>
                    {parseDateTime(resourceRecord.dateCreated)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.updated_at')}
                    </span>
                    {parseDateTime(resourceRecord.dateUpdated)}
                  </p>
                  {#if resourceRecord.description && resourceRecord.description.length < 172}
                    <p class="content">
                      <span class="badge mr-1">
                        {$t('common.description')}
                      </span>
                      {resourceRecord.description}
                    </p>
                  {/if}
                </div>
              </div>
              <div class="card-actions justify-end">
                <a
                  href={resourceRecord.source}
                  target="_blank"
                  rel="noreferrer"
                  class="btn btn-ghost border-2 hover:btn-outline min-w-fit"
                >
                  <i class="fa-solid fa-link"></i>
                  {$t('common.source')}
                </a>
              </div>
            </div>
            {#if resourceRecord.description && resourceRecord.description.length >= 172}
              <p class="mt-2 content">
                <span class="badge mr-1">
                  {$t('common.description')}
                </span>
                {resourceRecord.description}
              </p>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if $resourceRecord.isError}
  <Error error={$resourceRecord.error} back="/resource-records" />
{:else}
  <div class="min-h-page skeleton" />
{/if}

<style>
  .info {
    height: calc(100% - 48px);
  }
</style>
