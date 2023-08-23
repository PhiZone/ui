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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          class="stroke-current flex-shrink-0 w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="content">{headline}</span>
      </div>
    </div>
  {/if}
{/if}

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content w-full">
    <div class="w-5/6 form-control text-center">
      <h1 class="text-6xl font-bold">{$t('common.studio')}</h1>
      <p class="text-lg pt-6 whitespace-pre-wrap">
        {$t('studio.description')}
      </p>
      <a
        href="/studio_guide.html"
        target="_blank"
        rel="noreferrer"
        class="text-lg hover:underline max-w-fit mx-auto my-3"
      >
        {$t('studio.view_guide')}
      </a>
      <div class="mt-3 flex justify-center">
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
