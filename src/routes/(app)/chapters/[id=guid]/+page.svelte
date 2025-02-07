<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';
  import Illustration from '$lib/components/Illustration.svelte';
  import Like from '$lib/components/Like.svelte';
  import Song from '$lib/components/Song.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { searchParams, id, api } = $derived(data);

  let chapterQuery = $derived(createQuery(api.chapter.info({ id })));
  let songsQuery = $derived(createQuery(api.chapter.listSongs({ id })));

  let illustrationOpen = $state(false);
</script>

<svelte:head>
  <title>
    {$t('chapter.chapter')} - {$chapterQuery.data?.data?.title} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $chapterQuery.isSuccess}
  {@const chapter = $chapterQuery.data.data}
  <Illustration
    bind:open={illustrationOpen}
    illustrator={chapter.illustrator}
    illustration={chapter.illustration}
  />

  <div class="background min-h-screen" style:background-image="url({chapter.illustration})">
    <div class="hero-overlay bg-opacity-60"></div>
    <div class="pt-32 pb-24 w-full flex flex-col max-w-[1600px] px-4 md:px-32 mx-auto">
      <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
        {chapter.title}
      </h1>
      <h2 class="text-4xl font-bold drop-shadow-lg my-3 text-neutral-content">
        {chapter.subtitle}
      </h2>
      <p class="text-xl mt-3 mb-6 content text-neutral-content">
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
          <button
            onclick={() => (illustrationOpen = true)}
            class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
          >
            {$t('common.view_illustration')}
          </button>
        </div>
        <div class="indicator my-4">
          <span
            class="indicator-item badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.owner')}
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
            {#if $songsQuery.isLoading}
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
            {:else if $songsQuery.isSuccess}
              {@const songs = $songsQuery.data.data}
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
{:else if $chapterQuery.isError}
  <Error error={$chapterQuery.error} back="/chapters" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
