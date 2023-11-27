<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';

  export let data;
  $: ({ api } = data);

  $: headline = createQuery(api.headline.getStudio());
</script>

<svelte:head>
  <title>{$t('common.studio')} | {$t('common.title')}</title>
</svelte:head>

{#if $headline.isSuccess}
  {@const headline = $headline.data.message}
  {#if headline}
    <div class="flex justify-center">
      <div class="alert w-fit alert-info shadow-lg top-20 fixed mx-8">
        <i class="fa-solid fa-circle-info fa-xl"></i>
        <span class="content">{headline}</span>
      </div>
    </div>
  {/if}
{/if}

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content w-full">
    <div class="w-5/6 form-control text-center">
      <h1 class="text-6xl font-bold">{$t('common.studio')}</h1>
      <p class="text-lg pt-6 whitespace-pre-wrap">
        {$t('studio.description')}
      </p>
      <!-- <a
        href="/studio_guide.html"
        target="_blank"
        rel="noreferrer"
        class="text-lg hover:underline max-w-fit mx-auto mt-3"
      >
        {$t('studio.view_guide')}
      </a> -->
      <div class="mt-6 flex justify-center">
        <a
          href="/studio/chart-submissions/new"
          class="btn btn-secondary lg:btn-lg btn-outline mr-3"
        >
          {$t('studio.upload_chart')}
        </a>
        <a href="/studio/song-submissions/new" class="btn btn-accent lg:btn-lg btn-outline ml-3">
          {$t('studio.upload_song')}
        </a>
      </div>
    </div>
  </div>
</div>
