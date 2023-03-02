<script lang="ts">
  import { Status } from '$lib/constants';
  import { locale, t } from '$lib/translations/config';
  import * as api from '$lib/api';
  import { onMount } from 'svelte';
  import Comment from '$lib/components/comment.svelte';
  import Pagination from '$lib/components/pagination.svelte';
  import Like from '$lib/components/like.svelte';
  import User from '$lib/components/user.svelte';
  import { getImage } from '$lib/utils';
  export let data: import('./$types').PageData;
  $: ({ status, content, error, songRes, commentRes, access_token, user } = data);

  let songPageIndex = 1,
    songs: any[] | null,
    songCount: number,
    previousSongs: string,
    nextSongs: string,
    songStatus = Status.RETRIEVING,
    comment = '',
    commentPageIndex = 1,
    comments: any[] | null,
    commentCount: number,
    previousComments: string,
    nextComments: string,
    commentStatus = Status.RETRIEVING;

  onMount(() => {
    songStatus = status;
    commentStatus = status;
    if (songRes) {
      songs = songRes.results;
      songCount = songRes.count;
      previousSongs = songRes.previous;
      nextSongs = songRes.next;
    }
    if (commentRes) {
      comments = commentRes.results;
      commentCount = commentRes.count;
      previousComments = commentRes.previous;
      nextComments = commentRes.next;
    }
  });

  const sendComment = async () => {
    if (content && comment && comment.length > 0) {
      await api.POST(
        '/comments/',
        { chapter: content.id, content: comment, language: locale.get() },
        access_token,
        user
      );
      comment = '';
      getComments(commentPageIndex);
    }
  };

  const getComments = async (page?: number) => {
    if (content) {
      commentStatus = Status.RETRIEVING;
      comments = null;
      const resp = await api.GET(
        `/comments/?chapter=${content.id}&query_user=1&order=-like_count${
          page ? `&page=${page}` : ''
        }`,
        access_token,
        user
      );
      const json = await resp.json();
      comments = json.results;
      commentCount = json.count;
      previousComments = json.previous;
      nextComments = json.next;
      commentStatus = Status.OK;
    }
  };
</script>

<svelte:head>
  <title>{$t('chapter.chapter')} - {content?.title} | {$t('common.title')}</title>
</svelte:head>

{#if status === Status.OK && content !== null}
  <input type="checkbox" id="illustration" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 p-0 w-[59vw] max-w-[1600px]">
      <label
        for="illustration"
        class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2">✕</label
      >
      <div class="absolute left-2 bottom-2">
        <div class="btn-group btn-group-horizontal">
          <button class="btn btn-secondary btn-xs text-base no-animation">
            {$t('chapter.illustrator')}
          </button>
          <button class="btn btn-xs text-base no-animation">
            {content.illustrator}
          </button>
        </div>
      </div>
      <img src={getImage(content.illustration)} alt="Illustration" class="object-contain" />
    </div>
  </div>
  <div class="background min-h-screen" style={`background-image: url(${content.illustration});`}>
    <div class="hero-overlay bg-opacity-60" />
    <div class="pt-32 pb-24 mx-auto w-3/4 flex justify-center">
      <div class="w-full min-w-[700px] max-w-[1280px]">
        <h1 class="text-7xl text-neutral-content font-bold drop-shadow-xl">
          {content.title}
        </h1>
        <h2 class="text-4xl text-neutral-content font-bold drop-shadow-lg mt-3 mb-6">
          {content.subtitle}
        </h2>
        <p class="text-xl text-neutral-content mb-6 content">
          {content.description}
        </p>
        <div class="flex justify-between items-center">
          <div class="my-4 flex gap-3">
            <Like
              id={content.like}
              likes={content.like_count}
              type={'chapter'}
              target={content.id}
              token={access_token}
              {user}
              css="md w-36 text-lg"
            />
            <label
              for="illustration"
              class="btn btn-primary btn-outline btn-md min-w-fit w-36 text-lg"
              >{$t('chapter.view_illustration')}</label
            >
          </div>
          {#if typeof content.owner == 'object'}
            <div class="indicator my-4">
              <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
                >{$t('chapter.owner')}</span
              >
              <div class="w-fit">
                <User user={content.owner} operator={user} token={access_token} mini />
              </div>
            </div>
          {/if}
        </div>
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
            >{$t('chapter.songs')}</span
          >
          <div class="card w-full bg-base-100 shadow-lg">
            <div class="card-body">
              {#if songStatus === Status.OK && songs}
                {#if songs.length > 0}
                  <ul class="menu bg-base-100 w-full">
                    {#each songs as song}
                      <li class="overflow-hidden">
                        <a href={`/songs/${song.id}`} class="w-full h-[82px] flex px-5">
                          <div class="w-1/2">
                            <div class="text-xl font-bold">
                              {song.name}
                              {#if song.original}
                                <button class="btn btn-secondary btn-sm text-lg no-animation">
                                  {$t('song.original')}
                                </button>
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
                              type={'song'}
                              target={song.id}
                              token={access_token}
                              {user}
                              css="sm"
                            />
                          </div>
                        </a>
                      </li>
                    {/each}
                  </ul>
                  <Pagination
                    bind:previous={previousSongs}
                    bind:next={nextSongs}
                    bind:results={songs}
                    bind:count={songCount}
                    bind:pageIndex={songPageIndex}
                    bind:status={songStatus}
                    token={access_token}
                    {user}
                  />
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {/if}
            </div>
          </div>
        </div>
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
            >{$t('common.comments')}</span
          >
          <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
            <div class="card-body py-10">
              <div class="flex items-center">
                <textarea
                  class={`mr-3 textarea ${
                    access_token ? 'textarea-primary' : 'textarea-disabled pointer-events-none'
                  } w-11/12`}
                  placeholder={$t('common.write_comment')}
                  bind:value={comment}
                />
                <button
                  class={`ml-3 btn ${
                    comment.length > 0 && access_token
                      ? 'btn-outline btn-primary'
                      : 'btn-ghost btn-disabled'
                  } w-1/12 min-w-fit`}
                  on:click={() => {
                    sendComment();
                  }}>{$t('common.send')}</button
                >
              </div>
              {#if commentStatus === Status.OK && comments}
                {#if comments.length > 0}
                  {#each comments as comment}
                    <Comment {comment} token={access_token} {user} />
                  {/each}
                  <Pagination
                    bind:previous={previousComments}
                    bind:next={nextComments}
                    bind:results={comments}
                    bind:count={commentCount}
                    bind:pageIndex={commentPageIndex}
                    bind:status
                    token={access_token}
                    {user}
                  />
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {/if}
            </div>
          </div>
        </div>
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
