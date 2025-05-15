<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import type { SearchFilterType } from '$lib/filters';

  import { goto } from '$app/navigation';
  import SearchOptions from '$lib/components/SearchOptions/SearchOptionsCollapse.svelte';
  import { t } from '$lib/translations/config';

  import * as env from '$env/static/public';

  let { data } = $props();
  let { api } = $derived(data);

  let type: SearchFilterType = $state('charts');
  let text = $state('');

  let searchParams = $state(new URLSearchParams());

  let href = $derived(`/${type}?${text ? `search=${text}&` : ''}${searchParams.toString()}`);

  let headlineQuery = $derived(createQuery(api.headline.get()));
</script>

<svelte:head>
  <title>{$t('common.site_name')}</title>
</svelte:head>

{#if $headlineQuery.isSuccess}
  {@const headline = $headlineQuery.data.data.headline}
  {#if headline}
    <div
      class="alert w-fit transition border-2 normal-border hover:shadow-lg top-20 absolute left-1/2 -translate-x-1/2 z-50"
    >
      <i class="fa-solid fa-circle-info fa-xl"></i>
      <span class="content">{headline}</span>
    </div>
  {/if}
{:else if $headlineQuery.isError && [400, 401, 403, 404, 500, 502].includes($headlineQuery.error.httpStatus)}
  <div
    class="alert alert-error w-fit transition border-2 normal-border hover:shadow-lg top-20 absolute left-1/2 -translate-x-1/2 z-50"
  >
    <i class="fa-solid fa-circle-error fa-xl"></i>
    <span class="content">
      {$headlineQuery.error.httpStatus}
      {$t(`common.errors.${$headlineQuery.error.httpStatus}`)}
    </span>
  </div>
{/if}

{#if 'PUBLIC_PROMO_LINK' in env}
  <!-- svelte-ignore a11y_missing_attribute -->
  <iframe src={env.PUBLIC_PROMO_LINK as string} class="hidden"></iframe>
{/if}
<video autoplay muted loop class="bg-video">
  <source src="/background.webm" type="video/webm" />
</video>
<div class="hero min-h-screen overflow-y-auto">
  <div class="hero-overlay bg-opacity-30 z-10"></div>
  <div class="w-5/6 max-w-4xl form-control text-center py-32 z-10">
    <div class="text-neutral-content">
      <img class="logo" src="/favicon.ico" alt="Logo" />
      <h1 class="mb-3 text-6xl sm:text-8xl font-bold">{$t('common.site_name')}</h1>
      <p class="mb-5 sm:text-lg">
        {$t('home.description')}
      </p>
    </div>
    <form
      class="form-control"
      onsubmit={(e) => {
        e.preventDefault();
        goto(href);
      }}
    >
      <div class="join text-sm lg:text-md">
        <select
          class="select border-2 normal-border transition hover:select-secondary lg:select-lg join-item max-w-1/3"
          bind:value={type}
        >
          <option value="events">{$t('common.events')}</option>
          <option value="chapters">{$t('common.chapters')}</option>
          <option value="collections">{$t('common.collections')}</option>
          <option value="songs">{$t('common.songs')}</option>
          <option selected value="charts">{$t('common.charts')}</option>
          <option value="users">{$t('common.users')}</option>
        </select>
        <input
          type="text"
          placeholder={$t('common.search_placeholder', {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            resource: $t(`common.${type}`).toLowerCase(),
          })}
          class="input border-2 normal-border transition hover:input-secondary lg:input-lg join-item w-full"
          bind:value={text}
        />
        <button
          class="btn lg:btn-lg btn-square border-2 normal-border bg-base-100 hover:bg-secondary hover:btn-secondary join-item"
          aria-label={$t('common.search')}
        >
          <i class="fa-solid fa-magnifying-glass fa-lg"></i>
        </button>
      </div>
      {#key type}
        <SearchOptions {type} bind:params={searchParams} />
      {/key}
    </form>
  </div>
</div>

<style>
  .logo {
    margin: 10px auto 20px;
    display: block;
  }
  .bg-video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
