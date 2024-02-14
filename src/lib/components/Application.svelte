<script lang="ts">
  import { page } from '$app/stores';
  import type { ApplicationDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Like from './Like.svelte';

  $: ({ api, preferredApplication } = $page.data);

  export let application: ApplicationDto;
  export let fixedHeight = true;
  export let showLike = true;

  $: owner = createQuery(api.user.info({ id: application.ownerId }));
</script>

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a href={`/applications/${application.id}`}>
    <figure class="h-[167px] relative">
      <img
        src={getCompressedImage(application.illustration)}
        alt="Illustration"
        class="object-fill"
      />
    </figure>
    <div class="card-body {fixedHeight ? 'h-[250px]' : ''} py-6 gap-0.5">
      <div class="flex items-center gap-2 w-full mb-1">
        <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
          {application.name}
        </h2>
        {#if preferredApplication == application.id}
          <div class="tooltip tooltip-right tooltip-primary" data-tip={$t('common.preferred')}>
            <button class="btn btn-xs btn-circle btn-primary no-animation">
              <i class="fa-solid fa-star"></i>
            </button>
          </div>
        {/if}
      </div>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.type')}</span>
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">
          {$t(`application.types.${application.type}`)}
        </span>
      </p>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.illustrator')}</span>
        <span class="whitespace-nowrap overflow-hidden text-ellipsis">
          {application.illustrator}
        </span>
      </p>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.owner')}</span>
        {#if $owner.isSuccess}
          <span class="whitespace-nowrap overflow-hidden text-ellipsis">
            {$owner.data.data.userName}
          </span>
        {:else}
          <span class="skeleton w-2/3 h-6"></span>
        {/if}
      </p>
      {#if application.description}
        <p class="flex items-center">
          <span class="content description">
            <span class="inline-flex badge mr-1">{$t('common.description')}</span>
            {application.description}
          </span>
        </p>
      {/if}
      {#if showLike}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="card-actions justify-end"
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
