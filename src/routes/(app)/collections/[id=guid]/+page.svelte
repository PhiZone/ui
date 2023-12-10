<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Chart from '$lib/components/Chart.svelte';
  import Like from '$lib/components/Like.svelte';
  import User from '$lib/components/User.svelte';
  import Comments from '$lib/components/Comments.svelte';

  export let data;

  $: ({ searchParams, id, api } = data);

  $: collection = createQuery(api.collection.info({ id }));
  $: charts = createQuery(api.collection.listCharts({ id }));
</script>

<svelte:head>
  <title>
    {$t('collection.collection')} - {$collection.data?.data?.title} | {$t('common.title')}
  </title>
</svelte:head>

{#if $collection.isSuccess && $collection.data.data}
  {@const collection = $collection.data.data}
  <input type="checkbox" id="illustration" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 p-0 max-w-fit aspect-video">
      <label
        for="illustration"
        class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="absolute left-2 bottom-2">
        <div class="join join-horizontal">
          <div class="btn btn-secondary btn-xs join-item text-base no-animation">
            {$t('collection.illustrator')}
          </div>
          <div class="btn btn-xs join-item text-base no-animation">
            {collection.illustrator}
          </div>
        </div>
      </div>
      <img src={collection.illustration} alt="Illustration" class="object-cover" />
    </div>
  </div>

  <div class="background min-h-screen" style:background-image="url({collection.illustration})">
    <div class="hero-overlay bg-base-300 bg-opacity-50" />
    <div class="pt-32 pb-24 w-full flex justify-center">
      <div class="w-full max-w-[1280px] mx-16">
        <h1 class="text-7xl font-bold drop-shadow-xl">
          {collection.title}
        </h1>
        <h2 class="text-4xl font-bold drop-shadow-lg mt-3 mb-6">
          {collection.subtitle}
        </h2>
        <p class="text-xl mb-6 content">
          {collection.description}
        </p>
        <div class="flex justify-between items-center flex-wrap">
          <div class="my-4 flex gap-3">
            <Like
              id={collection.id}
              likes={collection.likeCount}
              type="collections"
              liked={collection.dateLiked != null}
              class="btn-md w-36 text-lg btn-outline backdrop-blur"
            />
            <label
              for="illustration"
              class="btn border-2 btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
            >
              {$t('collection.view_illustration')}
            </label>
          </div>
          <div class="indicator my-4">
            <span
              class="indicator-item badge badge-secondary badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('collection.owner')}
            </span>
            <div class="w-fit">
              <User id={collection.ownerId} kind="mini" />
            </div>
          </div>
        </div>
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('collection.charts')}
          </span>
          <div class="card w-full bg-base-100 transition border-2 border-gray-700 hover:shadow-lg">
            <div class="card-body">
              {#if $charts.isLoading}
                <ul class="menu bg-base-100 w-full">
                  <li class="overflow-hidden">
                    <div class="w-full h-[82px] flex px-5">
                      <div class="w-1/2">
                        <div class="w-[300px] h-7 skeleton rounded" />
                      </div>
                      <div class="w-5/12">
                        <div class="w-[200px] h-7 skeleton rounded" />
                      </div>
                      <div class="w-1/12 min-w-fit">
                        <btn class="w-16 h-12 btn btn-sm" disabled />
                      </div>
                    </div>
                  </li>
                </ul>
              {:else if $charts.isSuccess}
                {@const charts = $charts.data.data}
                {#if charts.length > 0}
                  <ul class="menu bg-base-100 w-full">
                    {#each charts as chart}
                      <li><Chart {chart} kind="inline" /></li>
                    {/each}
                  </ul>
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {/if}
            </div>
          </div>
        </div>
        <Comments type="collections" id={collection.id} {searchParams} />
      </div>
    </div>
  </div>
{/if}

<style>
  .background {
    background-attachment: fixed;
    display: grid;
    background-size: cover;
    background-position: center;
  }
  .background > * {
    grid-column-start: 1;
    grid-row-start: 1;
  }
</style>
