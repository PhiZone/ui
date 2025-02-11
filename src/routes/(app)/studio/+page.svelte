<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import { t } from '$lib/translations/config';

  export let data;
  $: ({ api } = data);

  $: headline = createQuery(api.headline.getStudio());
</script>

<svelte:head>
  <title>{$t('common.studio')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $headline.isSuccess}
  {@const headline = $headline.data.data.headline}
  {#if headline}
    <div
      class="alert w-fit transition border-2 normal-border hover:shadow-lg top-20 absolute left-1/2 -translate-x-1/2 z-50"
    >
      <i class="fa-solid fa-circle-info fa-xl"></i>
      <span class="content">{headline}</span>
    </div>
  {/if}
{:else if $headline.isError && [400, 401, 403, 404, 500, 502].includes($headline.error.httpStatus)}
  <div
    class="alert alert-error w-fit transition border-2 normal-border hover:shadow-lg top-20 absolute left-1/2 -translate-x-1/2 z-50"
  >
    <i class="fa-solid fa-circle-error fa-xl"></i>
    <span class="content">
      {$headline.error.httpStatus}
      {$t(`common.errors.${$headline.error.httpStatus}`)}
    </span>
  </div>
{/if}

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content w-full">
    <div class="w-5/6 form-control text-center">
      <h1 class="text-4xl sm:text-6xl font-bold">{$t('common.studio')}</h1>
      <p class="sm:text-lg pt-6 whitespace-pre-wrap">
        {$t('studio.description')}
      </p>
      <div class="mt-6 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mx-auto">
        <a
          href="/studio/chart-submissions/new"
          class="btn lg:btn-lg btn-outline border-2 normal-border"
        >
          {$t('studio.upload_chart')}
        </a>
        <a
          href="/studio/song-submissions/new"
          class="btn lg:btn-lg btn-outline border-2 normal-border"
        >
          {$t('studio.upload_song')}
        </a>
      </div>
    </div>
  </div>
</div>
