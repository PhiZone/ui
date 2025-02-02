<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import { goto } from '$app/navigation';
  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';
  import Like from '$lib/components/Like.svelte';
  import Service from '$lib/components/Service.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';

  export let data;

  $: ({ searchParams, id, user, api, preferredApplication } = data);

  $: applicationQuery = createQuery(api.application.info({ id }));
  $: servicesQuery = createQuery(api.service.list({ rangeResourceId: [id] }));
</script>

<svelte:head>
  <title>
    {$t('application.application')} - {$applicationQuery.data?.data.name} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $applicationQuery.isSuccess}
  {@const application = $applicationQuery.data.data}
  <div class="info-page">
    <div class="mx-4 min-w-[300px] max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('application.application')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              <h2 class="text-5xl font-bold content md:inline-block">
                {application.name}
              </h2>
              {#if preferredApplication == application.id}
                <div
                  class="tooltip tooltip-right tooltip-primary"
                  data-tip={$t('common.preferred')}
                >
                  <div class="btn btn-sm btn-circle btn-primary no-animation">
                    <i class="fa-solid fa-star"></i>
                  </div>
                </div>
              {/if}
            </div>
            <div class="flex gap-2 flex-col lg:flex-row">
              <div class="lg:w-1/3 form-control justify-between">
                <div class="form-control gap-1">
                  <p>
                    <span class="badge mr-1">
                      {$t('common.type')}
                    </span>
                    {$t(`application.types.${application.type}`)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.illustrator')}
                    </span>
                    {application.illustrator}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.date_created')}
                    </span>
                    {parseDateTime(application.dateCreated)}
                  </p>
                  <p>
                    <span class="badge mr-1">
                      {$t('common.date_updated')}
                    </span>
                    {parseDateTime(application.dateUpdated)}
                  </p>
                  {#if application.description && application.description.length < 172}
                    <p class="content">
                      <span class="badge mr-1">
                        {$t('common.description')}
                      </span>
                      {application.description}
                    </p>
                  {/if}
                </div>
                <div
                  class="mb-2 w-full justify-center join join-vertical sm:join-horizontal lg:join-vertical 2xl:join-horizontal"
                >
                  <Like
                    id={application.id}
                    likes={application.likeCount}
                    type="applications"
                    liked={application.dateLiked != null}
                    class="btn-md join-item"
                  />
                  {#if user && [0, 2, 4].includes(application.type)}
                    {#if preferredApplication == application.id}
                      <button
                        class="btn btn-ghost border-2 hover:btn-outline join-item"
                        on:click={() => {
                          goto('?preferred=0');
                        }}
                      >
                        <i class="fa-solid fa-star"></i>
                        {$t('common.unset_as_preferred')}
                      </button>
                    {:else}
                      <button
                        class="btn btn-ghost border-2 hover:btn-outline join-item"
                        on:click={() => {
                          goto('?preferred=1');
                        }}
                      >
                        <i class="fa-regular fa-star"></i>
                        {$t('common.set_as_preferred')}
                      </button>
                    {/if}
                  {/if}
                  <a
                    href={application.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-ghost border-2 hover:btn-outline min-w-fit join-item"
                  >
                    <i class="fa-solid fa-link"></i>
                    {$t('application.visit')}
                  </a>
                </div>
              </div>
              <div class="lg:w-2/3">
                <div
                  class="rounded-lg transition border-2 normal-border hover:shadow-lg overflow-hidden bg-cover bg-center bg-no-repeat"
                >
                  <div class="relative">
                    <img src={application.illustration} class="object-fill" alt="Illustration" />
                  </div>
                </div>
              </div>
            </div>
            {#if application.description && application.description.length >= 172}
              <p class="mt-2 content">
                <span class="badge mr-1">
                  {$t('common.description')}
                </span>
                {application.description}
              </p>
            {/if}
          </div>
        </div>
      </div>
      {#if $servicesQuery.isSuccess && $servicesQuery.data.data.length > 0}
        {@const services = $servicesQuery.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.services')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body pt-14 pb-10">
              <a
                class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
                href="/services?rangeResourceId={id}"
              >
                {$t('common.more')}
                <i class="fa-solid fa-angles-right"></i>
              </a>
              <div class="result">
                {#each services as service}
                  <Service {service} />
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
      <Comments type="applications" {id} {searchParams} />
    </div>
    <div class="mx-auto lg:mx-4 w-80 form-control">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('common.owner')}
        </span>
        <User id={application.ownerId} />
      </div>
    </div>
  </div>
{:else if $applicationQuery.isError}
  <Error error={$applicationQuery.error} back="/applications" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
