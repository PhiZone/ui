<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import type { ApplicationDto } from '$lib/api';

  import { page } from '$app/state';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';

  import Like from './Like.svelte';

  let { api, preferredApplication } = $derived(page.data);

  interface Props {
    application: ApplicationDto;
    fixedHeight?: boolean;
    showLike?: boolean;
  }
  let { application, fixedHeight = true, showLike = true }: Props = $props();

  let owner = $derived(createQuery(api.user.info({ id: application.ownerId })));
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
        <h2 class="title truncate">
          {application.name}
        </h2>
        {#if preferredApplication == application.id}
          <div class="tooltip tooltip-right tooltip-primary" data-tip={$t('common.preferred')}>
            <div class="btn btn-xs btn-circle btn-primary no-animation">
              <i class="fa-solid fa-star"></i>
            </div>
          </div>
        {/if}
      </div>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.type')}</span>
        <span class="truncate">
          {$t(`application.types.${application.type}`)}
        </span>
      </p>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.illustrator')}</span>
        <span class="truncate">
          {application.illustrator}
        </span>
      </p>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.owner')}</span>
        {#if $owner.isSuccess}
          <span class="truncate">
            {$owner.data.data.userName}
          </span>
        {:else}
          <span class="skeleton w-2/3 h-6"></span>
        {/if}
      </p>
      {#if application.description}
        <p class="flex items-center">
          <span class="description">
            <span class="inline-flex badge mr-1">{$t('common.description')}</span>
            {application.description}
          </span>
        </p>
      {/if}
      {#if showLike}
        <div class="card-actions justify-end">
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
