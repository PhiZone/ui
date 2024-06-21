<script lang="ts">
  import { page } from '$app/stores';
  import type { CollectionDto, CollectionAdmitterDto } from '$lib/api/collection';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Like from './Like.svelte';

  $: ({ api } = $page.data);

  export let collection: CollectionDto | CollectionAdmitterDto;
  export let fixedHeight = true;
  export let showLike = true;

  $: owner = createQuery(api.user.info({ id: collection.ownerId }));
</script>

<a
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
  href="/collections/{collection.id}"
>
  <figure class="h-[167px] relative">
    <img src={getCompressedImage(collection.illustration)} alt="Illustration" class="object-fill" />
    {#if 'label' in collection && collection.label}
      <div class="absolute bottom-2 right-2">
        <button class="btn btn-shallow btn-sm text-xl no-animation">
          {collection.label}
        </button>
      </div>
    {/if}
  </figure>
  <div class="card-body {fixedHeight ? 'h-[244px]' : ''} py-6 gap-0.5">
    <div class="flex flex-col mb-2">
      <h2 class="title-strong w-full truncate">
        {collection.title}
      </h2>
      <h2 class="subtitle opacity-80 w-full truncate">
        {collection.subtitle}
      </h2>
    </div>
    <p class="flex items-center gap-1">
      <span class="badge">{$t('common.illustrator')}</span>
      <span class="truncate">
        {collection.illustrator}
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
    {#if collection.description}
      <p class="flex items-center">
        <span class="content description">
          <span class="inline-flex badge mr-1">{$t('common.description')}</span>
          {collection.description}
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
          id={collection.id}
          likes={collection.likeCount}
          type="collections"
          liked={collection.dateLiked != null}
          class="btn-sm"
        />
      </div>
    {/if}
  </div>
</a>
