<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import Like from '$lib/components/Like.svelte';
  import User from '$lib/components/User.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;

  $: ({ searchParams, id, api } = data);

  $: chapter = createQuery(api.chapter.info({ id }));
  $: songs = createQuery(api.chapter.listSongs({ id }));
</script>

<svelte:head>
  <title>{$t('chapter.chapter')} - {$chapter.data?.data?.title} | {$t('common.title')}</title>
</svelte:head>

{#if $chapter.isSuccess}
  {@const chapter = $chapter.data.data}
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
            {$t('chapter.illustrator')}
          </div>
          <div class="btn btn-xs join-item text-base no-animation">
            {chapter.illustrator}
          </div>
        </div>
      </div>
      <img src={chapter.illustration} alt="Illustration" class="object-cover" />
    </div>
  </div>

  <div class="background min-h-screen" style:background-image="url({chapter.illustration})">
    <div class="hero-overlay bg-opacity-40" />
    <div class="pt-32 pb-24 w-full flex flex-col max-w-[1600px] px-4 md:px-32 mx-auto">
      <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
        {chapter.title}
      </h1>
      <h2 class="text-4xl font-bold drop-shadow-lg mt-3 mb-6 text-neutral-content">
        {chapter.subtitle}
      </h2>
      <p class="text-xl mb-6 content text-neutral-content">
        {chapter.description}
      </p>
      <div class="flex justify-between items-center flex-wrap">
        <div class="my-4 flex gap-3">
          <Like
            id={chapter.id}
            likes={chapter.likeCount}
            type="chapters"
            liked={chapter.dateLiked != null}
            class="btn-md w-36 text-lg border-neutral-content text-neutral-content btn-outline backdrop-blur"
          />
          <label
            for="illustration"
            class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
          >
            {$t('chapter.view_illustration')}
          </label>
        </div>
        <div class="indicator my-4">
          <span
            class="indicator-item badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chapter.owner')}
          </span>
          <div class="w-fit">
            <User id={chapter.ownerId} kind="mini" />
          </div>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chapter.songs')}
        </span>
        <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
          <div class="card-body">
            {#if $songs.isLoading}
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
            {:else if $songs.isSuccess}
              {@const songs = $songs.data.data}
              {#if songs.length > 0}
                <ul class="menu bg-base-100 w-full">
                  {#each songs as song}
                    <li><Song {song} kind="inline" /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
      <Comments type="chapters" id={chapter.id} {searchParams} />
    </div>
  </div>
{:else if $chapter.isError}
  <Error error={$chapter.error} back="/chapters" />
{:else}
  <div class="min-h-page skeleton" />
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
