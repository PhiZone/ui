<script lang="ts">
  import { page } from '$app/stores';
  import type { ApplicationDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Like from './Like.svelte';

  $: ({ api } = $page.data);

  export let application: ApplicationDto;
  export let fixedHeight = true;

  $: owner = createQuery(api.user.info({ id: application.ownerId }));
</script>

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 border-gray-700 hover:border-primary hover:shadow-lg"
>
  <a href={`/applications/${application.id}`}>
    <figure class="h-[167px] relative">
      <img
        src={getCompressedImage(application.illustration)}
        alt="Illustration"
        class="object-fill"
      />
      <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle"></div>
    </figure>
    <div class="card-body {fixedHeight ? 'h-[255px]' : ''} py-6 gap-0.5">
      <h2 class="title w-full mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
        {application.name}
      </h2>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis grow-0">
        <span class="badge mr-1">{$t('application.type')}</span>
        {$t(`application.types.${application.type}`)}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis grow-0">
        <span class="badge mr-1">{$t('application.illustrator')}</span>
        {application.illustrator}
      </p>
      <div class="flex items-center grow-0">
        <span class="badge mr-1">{$t('application.owner')}</span>
        {#if $owner.isSuccess}
          <p class="whitespace-nowrap overflow-hidden text-ellipsis">
            {$owner.data.data.userName}
          </p>
        {:else}
          <div class="skeleton w-2/3 h-6"></div>
        {/if}
      </div>
      {#if application.description}
        <p class="content description grow-0">
          <span class="badge mr-1">{$t('common.description')}</span>
          {application.description}
        </p>
      {/if}
      {#if fixedHeight}
        <div class="absolute bottom-8 right-8">
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            on:click={(e) => {
              e.preventDefault();
            }}
            on:keyup
          >
            <Like
              id={application.id}
              likes={application.likeCount}
              type="applications"
              liked={application.dateLiked != null}
              class="btn-sm"
            />
          </div>
        </div>
      {/if}
    </div>
  </a>
</div>

<style>
  .description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
</style>
