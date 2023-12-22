<script lang="ts">
  import { page } from '$app/stores';
  import type { SongSubmissionDto } from '$lib/api';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, getCompressedImage, parseDateTime } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import { readable } from 'svelte/store';

  $: ({ user, api } = $page.data);

  export let song: SongSubmissionDto;

  $: composer = song.originalityProof ? richtext(song.authorName ?? '') : readable(song.authorName);
  $: uploader = createQuery(api.user.info({ id: song.ownerId }));
</script>

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a href={`/studio/song-submissions/${song.id}`}>
    <figure class="h-[167px] relative">
      <img src={getCompressedImage(song.illustration)} alt="Illustration" class="object-fill" />
      {#if song.originalityProof}
        <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
          <button class="btn btn-accent btn-sm text-xl no-animation">
            {$t('song.original')}
          </button>
        </div>
      {/if}
    </figure>
    <div class="card-body py-6 gap-0.5">
      <div class="flex gap-2 mb-1 items-center">
        <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
          {song.title}
        </h2>
        {#if song.status === 1}
          <div
            class="tooltip tooltip-right tooltip-success"
            data-tip={$t('studio.submission.statuses.1')}
          >
            <button class="btn btn-xs btn-circle btn-success no-animation">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        {:else if song.status === 2}
          <div
            class="tooltip tooltip-right tooltip-error"
            data-tip={$t('studio.submission.statuses.2')}
          >
            <button class="btn btn-xs btn-circle btn-error no-animation">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        {:else}
          <div
            class="tooltip tooltip-right tooltip-warning"
            data-tip={$t('studio.submission.statuses.0')}
          >
            <button class="btn btn-xs btn-circle btn-warning no-animation">
              <i class="fa-solid fa-exclamation"></i>
            </button>
          </div>
        {/if}
      </div>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">{$t('song.edition')}</span>
        {song.edition ?? $t(`song.edition_types.${song.editionType}`)}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">{$t('song.composer')}</span>
        {@html $composer}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">{$t('song.duration')}</span>
        {convertTime(song.duration, true)}
      </p>
      <div class="grow-0 flex items-center">
        <span class="badge mr-1">{$t('chapter.owner')}</span>
        {#if $uploader.isSuccess}
          <p class="whitespace-nowrap overflow-hidden text-ellipsis">
            {$uploader.data.data.userName}
          </p>
        {:else}
          <div class="skeleton w-2/3 h-6"></div>
        {/if}
      </div>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">
          {$t('common.created_at')}
        </span>
        {parseDateTime(song.dateCreated, true, user?.language)}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">
          {$t('common.updated_at')}
        </span>
        {parseDateTime(song.dateUpdated, true, user?.language)}
      </p>
    </div>
  </a>
</div>
