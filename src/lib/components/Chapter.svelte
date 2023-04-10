<script lang="ts">
  import type { Chapter } from '$lib/models';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import Like from './Like.svelte';

  export let chapter: Chapter;
  export let fixedHeight = false;
</script>

<div
  class="card w-80 ${fixedHeight ? 'h-[460px]' : ''} bg-base-100 shadow-lg glass overflow-hidden"
>
  <a href="/chapters/{chapter.id}">
    <figure class="h-[180px]">
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
        <span class="badge badge-primary badge-outline mr-1">{$t('chapter.illustrator')}</span>
        {chapter.illustrator}
      </p>
      <!-- <p class="whitespace-nowrap overflow-hidden text-ellipsis grow-0">
        <span class="badge badge-primary badge-outline mr-1">{$t('chapter.owner')}</span>
        {chapter.owner}
      </p> -->
      {#if chapter.description}
        <p class="content description grow-0">
          <span class="badge badge-primary badge-outline mr-1">{$t('chapter.description')}</span>
          {chapter.description}
        </p>
      {/if}
      <p />
      <div class="card-actions flex items-center justify-end">
        <div
          on:click={(e) => {
            e.preventDefault();
          }}
          on:keyup
        >
          <Like
            id={chapter.like}
            likes={chapter.like_count}
            type="chapter"
            target={chapter.id}
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
