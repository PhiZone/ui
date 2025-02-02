<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Chart from '$lib/components/Chart.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';
  import Like from '$lib/components/Like.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';

  export let data;

  $: ({ searchParams, id, api } = data);

  $: collectionQuery = createQuery(api.collection.info({ id }));
  $: chartsQuery = createQuery(api.collection.listCharts({ id }));
</script>

<svelte:head>
  <title>
    {$t('collection.collection')} - {$collectionQuery.data?.data?.title} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $collectionQuery.isSuccess}
  {@const collection = $collectionQuery.data.data}
  <input type="checkbox" id="illustration" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 p-0 max-w-fit aspect-video">
      <label
        for="illustration"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="absolute left-2 bottom-2">
        <div class="join join-horizontal">
          <div class="btn btn-secondary btn-xs join-item text-base no-animation">
            {$t('common.illustrator')}
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
    <div class="hero-overlay bg-opacity-60"></div>
    <div class="pt-32 pb-24 w-full flex flex-col max-w-[1600px] px-4 md:px-32 mx-auto">
      <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
        {collection.title}
      </h1>
      <h2 class="text-4xl font-bold drop-shadow-lg my-3 text-neutral-content">
        {collection.subtitle}
      </h2>
      <p class="text-xl mt-3 mb-6 content text-neutral-content">
        {collection.description}
      </p>
      <div class="flex justify-between items-center flex-wrap">
        <div class="my-4 flex gap-3">
          <Like
            id={collection.id}
            likes={collection.likeCount}
            type="collections"
            liked={collection.dateLiked != null}
            class="btn-md w-36 text-lg border-neutral-content text-neutral-content btn-outline backdrop-blur"
          />
          <label
            for="illustration"
            class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
          >
            {$t('common.view_illustration')}
          </label>
        </div>
        <div class="indicator my-4">
          <span
            class="indicator-item badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.owner')}
          </span>
          <div class="w-fit">
            <User id={collection.ownerId} kind="mini" />
          </div>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('collection.charts')}
        </span>
        <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
          <div class="card-body">
            {#if $chartsQuery.isLoading}
              <ul class="menu bg-base-100 w-full">
                <li class="overflow-hidden">
                  <div class="w-full h-[82px] flex px-5">
                    <div class="w-1/2">
                      <div class="w-[300px] h-7 skeleton rounded"></div>
                    </div>
                    <div class="w-5/12">
                      <div class="w-[200px] h-7 skeleton rounded"></div>
                    </div>
                    <div class="w-1/12 min-w-fit">
                      <btn class="w-16 h-12 btn btn-sm" disabled></btn>
                    </div>
                  </div>
                </li>
              </ul>
            {:else if $chartsQuery.isSuccess}
              {@const charts = $chartsQuery.data.data}
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
{:else if $collectionQuery.isError}
  <Error error={$collectionQuery.error} back="/collections" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
