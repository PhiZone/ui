<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { goto } from '$app/navigation';
  import { t } from '$lib/translations/config';

  export let data;

  $: ({ api } = data);

  let type: 'chapters' | 'songs' | 'users' = 'songs';
  let text = '';

  $: href = `/${type}?${text ? `search=${text}` : ''}`;

  const search = () => goto(href);

  $: headline = createQuery(api.headline.get());
</script>

<svelte:head>
  <title>{$t('common.title')}</title>
</svelte:head>

{#if $headline.isSuccess}
  {@const headline = $headline.data.data.headline}
  {#if headline}
    <div class="flex justify-center">
      <div class="alert w-fit alert-info shadow-lg top-20 fixed mx-8">
        <i class="fa-solid fa-circle-info fa-xl"></i>
        <span class="content">{headline}</span>
      </div>
    </div>
  {/if}
{/if}

<div class="hero min-h-screen" style:background-image="url(/background.webp)">
  <div class="hero-overlay bg-opacity-50" />
  <div class="w-5/6 max-w-4xl form-control text-center">
    <img class="logo" src="/favicon.ico" alt="Logo" />
    <h1 class="mb-3 text-8xl font-bold">{$t('common.title')}</h1>
    <p class="mb-5 text-lg">
      {$t('home.description')}
    </p>
    <form class="form-control" on:submit|preventDefault={search}>
      <div class="join text-sm lg:text-md">
        <select
          class="select select-bordered lg:select-lg join-item max-w-1/3 text-base-content bg-opacity-80"
          bind:value={type}
        >
          <option value="chapters">{$t('common.chapters')}</option>
          <option selected value="songs">{$t('common.songs')}</option>
          <option value="users">{$t('common.users')}</option>
          <!-- <option value="discussions">{$t("common.discussions")}</option> -->
        </select>
        <input
          type="text"
          placeholder={$t('common.search_placeholder')}
          class="input input-bordered lg:input-lg join-item w-full bg-opacity-80 text-base-content"
          bind:value={text}
        />
        <a class="btn lg:btn-lg btn-square btn-primary join-item bg-opacity-80" {href}>
          <i class="fa-solid fa-magnifying-glass fa-xl"></i>
        </a>
      </div>
    </form>
  </div>
</div>

<style>
  .logo {
    margin: 10px auto 20px;
    display: block;
  }
</style>
