<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Like from '$lib/components/Like.svelte';
  import User from '$lib/components/User.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import type { PageData } from './$types';

  export let data: PageData;

  $: ({ searchParams, id, api } = data);

  $: chapter = createQuery(api.chapter.info({ id }));
  $: songs = createQuery(api.song.listAll({ chapter: id }));
</script>

<svelte:head>
  <title>{$t('chapter.chapter')} - {$chapter.data?.title} | {$t('common.title')}</title>
</svelte:head>

{#if $chapter.isSuccess}
  {@const chapter = $chapter.data}
  <input type="checkbox" id="illustration" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 p-0 w-[59vw] max-w-[1600px]">
      <label
        for="illustration"
        class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="absolute left-2 bottom-2">
        <div class="btn-group btn-group-horizontal">
          <div class="btn btn-secondary btn-xs text-base no-animation">
            {$t('chapter.illustrator')}
          </div>
          <div class="btn btn-xs text-base no-animation">
            {chapter.illustrator}
          </div>
        </div>
      </div>
      <img src={chapter.illustration} alt="Illustration" class="object-contain" />
    </div>
  </div>

  <div class="background min-h-screen" style:background-image="url({chapter.illustration})">
    <div class="hero-overlay bg-opacity-60" />
    <div class="pt-32 pb-24 mx-auto w-3/4 flex justify-center">
      <div class="w-full min-w-[700px] max-w-[1280px]">
        <h1 class="text-7xl text-neutral-content font-bold drop-shadow-xl">
          {chapter.title}
        </h1>
        <h2 class="text-4xl text-neutral-content font-bold drop-shadow-lg mt-3 mb-6">
          {chapter.subtitle}
        </h2>
        <p class="text-xl text-neutral-content mb-6 content">
          {chapter.description}
        </p>
        <div class="flex justify-between items-center">
          <div class="my-4 flex gap-3">
            <Like
              id={chapter.like}
              likes={chapter.like_count}
              type="chapter"
              target={chapter.id}
              class="btn-md w-36 text-lg"
            />
            <label
              for="illustration"
              class="btn btn-primary btn-outline btn-md min-w-fit w-36 text-lg"
            >
              {$t('chapter.view_illustration')}
            </label>
          </div>
          <div class="indicator my-4">
            <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
              {$t('chapter.owner')}
            </span>
            <div class="w-fit">
              <User id={chapter.owner} kind="mini" />
            </div>
          </div>
        </div>
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
          >
            {$t('chapter.songs')}
          </span>
          <div class="card w-full bg-base-100 shadow-lg">
            <div class="card-body">
              {#if $songs.isLoading}
                <ul class="menu bg-base-100 w-full">
                  <li class="overflow-hidden">
                    <div class="w-full h-[82px] flex px-5">
                      <div class="w-1/2">
                        <div class="w-[300px] h-7 bg-slate-200 rounded" />
                      </div>
                      <div class="w-5/12">
                        <div class="w-[200px] h-7 bg-slate-200 rounded" />
                      </div>
                      <div class="w-1/12 min-w-fit">
                        <btn class="w-16 h-12 btn btn-sm" disabled />
                      </div>
                    </div>
                  </li>
                </ul>
              {:else if $songs.isSuccess}
                {@const songs = $songs.data}
                {#if songs.length > 0}
                  <ul class="menu bg-base-100 w-full">
                    {#each songs as song}
                      <li class="overflow-hidden">
                        <a href={`/songs/${song.id}`} class="w-full h-[82px] flex px-5">
                          <div class="w-1/2">
                            <div class="text-xl font-bold">
                              {song.name}
                              {#if song.original}
                                <div class="btn btn-secondary btn-sm text-lg no-animation">
                                  {$t('song.original')}
                                </div>
                              {/if}
                            </div>
                          </div>
                          <div class="w-5/12 text-lg">
                            {song.composer}
                          </div>
                          <div
                            class="w-1/12 min-w-fit"
                            on:click={(e) => {
                              e.preventDefault();
                            }}
                            on:keyup
                          >
                            <Like
                              id={song.like}
                              likes={song.like_count}
                              type="song"
                              target={song.id}
                              class="sm"
                            />
                          </div>
                        </a>
                      </li>
                    {/each}
                  </ul>
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {/if}
            </div>
          </div>
        </div>
        <Comments type="chapter" id={chapter.id} {searchParams} />
      </div>
    </div>
  </div>
{/if}

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
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
