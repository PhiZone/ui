<script lang="ts">
  import { page } from '$app/stores';
  import type { ChapterDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Like from './Like.svelte';

  $: ({ api } = $page.data);

  export let chapter: ChapterDto;
  export let fixedHeight = false;

  $: owner = createQuery(api.user.info({ id: chapter.ownerId }));
</script>

<div
  class="card w-80 ${fixedHeight
    ? 'h-[460px]'
    : ''} bg-base-100 overflow-hidden transition border-2 border-gray-700 hover:border-primary hover:shadow-lg"
>
  <a href="/chapters/{chapter.id}">
    <figure class="h-[167px] relative">
      <img src={getCompressedImage(chapter.illustration)} alt="Illustration" class="object-fill" />
    </figure>
    <div class="card-body {fixedHeight ? 'h-[280px]' : ''} gap-0.5">
      <h2 class="title w-full whitespace-nowrap overflow-hidden text-ellipsis">
        {chapter.title}
      </h2>
      <h2 class="subtitle opacity-80 mb-2 w-full whitespace-nowrap overflow-hidden text-ellipsis">
        {chapter.subtitle}
      </h2>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis grow-0">
        <span class="badge mr-1">{$t('chapter.illustrator')}</span>
        {chapter.illustrator}
      </p>
      {#if $owner.isSuccess}
        <p class="whitespace-nowrap overflow-hidden text-ellipsis grow-0">
          <span class="badge mr-1">{$t('chapter.owner')}</span>
          {$owner.data.data.userName}
        </p>
      {/if}
      {#if chapter.description}
        <p class="content description grow-0">
          <span class="badge mr-1">{$t('chapter.description')}</span>
          {chapter.description}
        </p>
      {/if}
      <p />
      <div class="card-actions flex items-center justify-end">
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={(e) => {
            e.preventDefault();
          }}
          on:keyup
        >
          <Like
            id={chapter.id}
            likes={chapter.likeCount}
            type="chapters"
            liked={chapter.dateLiked != null}
            class="btn-sm"
          />
        </div>
      </div>
    </div>
  </a>
</div>

<style>
  .title {
    font-size: 1.25rem;
    line-height: 1.4rem;
    font-weight: 800;
  }
  .subtitle {
    font-size: 1rem;
    line-height: 1.2rem;
    font-weight: 600;
  }
  .description {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
</style>
