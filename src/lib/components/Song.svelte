<script lang="ts">
  import type { SongDto } from '$lib/api';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, getCompressedImage } from '$lib/utils';
  import { readable } from 'svelte/store';
  import Like from './Like.svelte';

  export let song: SongDto;
  export let kind: 'full' | 'inline' = 'full';
  export let showLike = true;

  // let easyCount = song.levels.find((e) => {
  //     return e.level === 'EZ';
  //   })?.count,
  //   hardCount = song.levels.find((e) => {
  //     return e.level === 'HD';
  //   })?.count,
  //   insaneCount = song.levels.find((e) => {
  //     return e.level === 'IN';
  //   })?.count,
  //   anotherCount = song.levels.find((e) => {
  //     return e.level === 'AT';
  //   })?.count,
  //   specialCount = song.levels.find((e) => {
  //     return e.level === 'SP';
  //   })?.count,
  //   otherCount = song.levels.length
  //     ? (typeof song.charts == 'object' ? song.charts.length : song.charts) -
  //       (easyCount ? easyCount : 0) -
  //       (hardCount ? hardCount : 0) -
  //       (insaneCount ? insaneCount : 0) -
  //       (anotherCount ? anotherCount : 0) -
  //       (specialCount ? specialCount : 0)
  //     : 0;

  $: composer = song.isOriginal ? richtext(song.authorName ?? '') : readable(song.authorName);
</script>

{#if kind === 'full'}
  <div
    class="card w-80 bg-base-100 overflow-hidden transition border-2 border-gray-700 hover:border-primary hover:shadow-lg"
  >
    <a href={`/songs/${song.id}`}>
      <figure class="h-[167px] relative">
        <img src={getCompressedImage(song.illustration)} alt="Illustration" class="object-fill" />
        {#if song.isOriginal}
          <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
            <button class="btn btn-secondary btn-sm text-xl no-animation">
              {$t('song.original')}
            </button>
          </div>
        {/if}
      </figure>
      <div class="card-body py-6 gap-0.5">
        <h2 class="title w-full mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {song.title}
        </h2>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('song.edition')}</span>
          {song.edition ?? $t(`song.edition_types.${song.editionType}`)}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('song.composer')}</span>
          {@html $composer}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('song.illustrator')}</span>
          {song.illustrator}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('song.bpm')}</span>
          {song.bpm}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('song.duration')}</span>
          {convertTime(song.duration, true)}
        </p>
        {#if showLike}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="absolute bottom-8 right-8"
            on:click={(e) => {
              e.preventDefault();
            }}
            on:keyup
          >
            <Like
              id={song.id}
              likes={song.likeCount}
              type="songs"
              liked={song.dateLiked != null}
              class="btn-sm"
            />
          </div>
        {/if}
      </div>
    </a>
  </div>
{:else if kind === 'inline'}
  <a href="/songs/{song.id}" class="w-full overflow-hidden flex px-5 h-16">
    <div class="w-11/12 md:w-7/12">
      <div class="text-xl font-bold ellipsis-2">
        {song.title}
        {#if song.isOriginal}
          <button class="btn btn-secondary btn-sm text-lg no-animation">
            {$t('song.original')}
          </button>
        {/if}
      </div>
    </div>
    <div class="w-0 md:w-1/3">
      <div class="text-lg hidden md:flex ellipsis-2-md">
        {@html $composer}
      </div>
    </div>
    {#if showLike}
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <div
        class="w-1/12 min-w-fit"
        on:click={(e) => {
          e.preventDefault();
        }}
        on:keyup
      >
        <Like
          id={song.id}
          likes={song.likeCount}
          type="songs"
          liked={song.dateLiked != null}
          class="btn-sm w-24"
        />
      </div>
    {/if}
  </a>
{/if}

<style>
  .ellipsis-2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .ellipsis-2-md {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 640px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
