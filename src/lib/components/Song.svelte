<script lang="ts">
  import { readable } from 'svelte/store';

  import type { SongAdmitteeDto, SongDto } from '$lib/api';

  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, getCompressedImage } from '$lib/utils';

  import Like from './Like.svelte';

  interface Props {
    song: SongDto | SongAdmitteeDto;
    kind?: 'full' | 'inline';
    showLike?: boolean;
  }
  let { song, kind = 'full', showLike = true }: Props = $props();

  let composer = $derived(
    song.isOriginal && song.authorName
      ? richtext(song.authorName)
      : readable(song.authorName ?? $t('common.anonymous')),
  );
</script>

{#if kind === 'full'}
  <div
    class={'eventDescription' in song && song.eventDescription ? 'tooltip tooltip-bottom' : ''}
    data-tip={'eventDescription' in song ? song.eventDescription : ''}
  >
    <a
      class="card text-left w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
      href={`/songs/${song.id}`}
    >
      <figure class="h-[167px] relative rounded-none">
        <img src={getCompressedImage(song.illustration)} alt="Illustration" class="object-fill" />
        <div class="absolute bottom-2 left-2 w-fit h-fit">
          {#if song.isOriginal}
            <button class="btn btn-accent btn-sm text-xl no-animation join-item">
              {$t('song.original')}
            </button>
          {/if}
        </div>
        {#if 'label' in song && song.label}
          <div class="absolute bottom-2 right-2">
            <div
              class={song.label.length > 10 ? 'tooltip tooltip-bottom' : ''}
              data-tip={song.label}
            >
              <button class="btn btn-sm btn-shallow btn-active no-animation join-item text-lg">
                {song.label.length > 10 ? `${song.label.substring(0, 10)}...` : song.label}
              </button>
            </div>
          </div>
        {/if}
      </figure>
      <div class="card-body py-6 gap-0.5">
        <h2 class="title w-full mb-1 truncate">
          {song.title}
        </h2>
        <p class="truncate">
          <span class="badge mr-1">{$t('song.edition')}</span>
          {song.edition ?? $t(`song.edition_types.${song.editionType}`)}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('song.composer')}</span>
          {@html $composer}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('common.illustrator')}</span>
          {song.illustrator}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('song.bpm')}</span>
          {song.bpm}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('song.duration')}</span>
          {convertTime(song.duration, true)}
        </p>
        {#if showLike}
          <div class="absolute bottom-8 right-8">
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
  <a
    href="/songs/{song.id}"
    class="w-full flex items-center px-5 h-16 {'eventDescription' in song && song.eventDescription
      ? 'tooltip tooltip-bottom'
      : ''}"
    data-tip={'eventDescription' in song ? song.eventDescription : ''}
  >
    <div class="w-11/12 md:w-7/12">
      <div class="flex gap-2 items-center">
        <div class="join join-horizontal">
          {#if song.isOriginal}
            <button class="btn btn-accent btn-sm text-xl no-animation join-item">
              {$t('song.original')}
            </button>
          {/if}
          {#if 'label' in song && song.label}
            <div
              class={song.label.length > 10 ? 'tooltip tooltip-right' : ''}
              data-tip={song.label}
            >
              <button class="btn btn-sm btn-shallow btn-active no-animation join-item text-lg">
                {song.label.length > 10 ? `${song.label.substring(0, 10)}...` : song.label}
              </button>
            </div>
          {/if}
        </div>
        <p class="text-xl font-bold ellipsis-2 max-w-fit">
          {song.title}
        </p>
      </div>
    </div>
    <div class="w-0 md:w-1/3">
      <div class="text-lg hidden md:flex ellipsis-2-md">
        {@html $composer}
      </div>
    </div>
    {#if showLike}
      <div class="w-1/12 min-w-fit hidden sm:inline">
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
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .ellipsis-2-md {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 768px) {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
