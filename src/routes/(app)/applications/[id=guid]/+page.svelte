<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  import Comments from '$lib/components/Comments.svelte';
  import User from '$lib/components/User.svelte';
  import Like from '$lib/components/Like.svelte';

  export let data;

  $: ({ searchParams, id, user, api } = data);

  $: application = createQuery(api.application.info({ id }));
</script>

<svelte:head>
  <title>
    {$t('application.application')} - {$application.data?.data.name} | {$t('common.title')}
  </title>
</svelte:head>

{#if $application.isSuccess}
  {@const application = $application.data.data}
  <div class="info-page">
    <div class="mx-4 min-w-[300px] max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('application.application')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              <h2 class="text-5xl font-bold content md:inline-block">
                {application.name}
              </h2>
            </div>
            <div class="flex gap-2 flex-col lg:flex-row">
              <div class="lg:w-1/3">
                <div class="info">
                  <div class="form-control gap-1">
                    <!-- <p>
                      <span class="badge mr-1">{$t('application.id')}</span>
                      {application.id}
                    </p> -->
                    <p>
                      <span class="badge mr-1">
                        {$t('application.type')}
                      </span>
                      {$t(`application.types.${application.type}`)}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('application.illustrator')}
                      </span>
                      {application.illustrator}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('common.created_at')}
                      </span>
                      {parseDateTime(application.dateCreated)}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('common.updated_at')}
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
                </div>
                <div
                  class="mb-2 flex items-end w-full justify-center {user
                    ? 'join join-horizontal'
                    : ''}"
                >
                  <Like
                    id={application.id}
                    likes={application.likeCount}
                    type="applications"
                    liked={application.dateLiked != null}
                    class="btn-md join-item"
                  />
                  <a
                    href={application.homepage}
                    target="_blank"
                    rel="noreferrer"
                    class="btn btn-ghost border-2 hover:btn-outline min-w-fit join-item"
                  >
                    <i class="fa-solid fa-link"></i>
                    {$t('application.visit')}
                  </a>
                </div>
              </div>
              <div class="lg:w-2/3">
                <div class="rounded-lg shadow-lg overflow-hidden bg-cover bg-center bg-no-repeat">
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
      <Comments type="applications" {id} {searchParams} />
    </div>
    <div class="mx-auto lg:mx-4 w-80 form-control">
      <div class="indicator my-4 w-full">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('application.owner')}
        </span>
        <User id={application.ownerId} />
      </div>
    </div>
  </div>
{/if}

<style>
  .info {
    height: calc(100% - 48px);
  }
</style>
