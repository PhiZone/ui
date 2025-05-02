<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { readable } from 'svelte/store';

  import type { SongSubmissionDto } from '$lib/api';

  import { page } from '$app/state';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, getCompressedImage, parseDateTime } from '$lib/utils';

  let { user, api } = $derived(page.data);

  interface Props {
    song: SongSubmissionDto;
    target?: '_self' | '_blank';
    showDateUpdated?: boolean;
  }
  let { song, target = '_self', showDateUpdated = true }: Props = $props();

  let composer = $derived(
    song.originalityProof ? richtext(song.authorName ?? '') : readable(song.authorName),
  );
  let uploader = $derived(createQuery(api.user.info({ id: song.ownerId })));
</script>

<div
  class="card w-80 bg-base-100 transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a href={`/studio/song-submissions/${song.id}`} {target}>
    <figure class="h-[167px] relative">
      <img
        src={getCompressedImage(song.illustration)}
        alt="Illustration"
        class="object-fill rounded-t-2xl"
      />
      {#if song.originalityProof}
        <div class="absolute bottom-2 left-2 w-fit h-fit">
          <button class="btn btn-accent btn-sm text-xl no-animation">
            {$t('song.original')}
          </button>
        </div>
      {/if}
    </figure>
    <div class="card-body py-6 gap-0.5">
      <div class="flex gap-2 mb-1 items-center">
        <h2 class="title truncate">
          {song.title}
        </h2>
        {#if song.status === 1}
          <div
            class="flex items-center tooltip tooltip-right tooltip-success"
            data-tip={$t('studio.submission.statuses.1')}
          >
            <div class="btn btn-xs btn-circle btn-success no-animation">
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        {:else if song.status === 2}
          <div
            class="flex items-center tooltip tooltip-right tooltip-error"
            data-tip={$t('studio.submission.statuses.2')}
          >
            <div class="btn btn-xs btn-circle btn-error no-animation">
              <i class="fa-solid fa-xmark"></i>
            </div>
          </div>
        {:else}
          <div
            class="flex items-center tooltip tooltip-right tooltip-warning"
            data-tip={$t('studio.submission.statuses.0')}
          >
            <div class="btn btn-xs btn-circle btn-warning no-animation">
              <i class="fa-solid fa-exclamation"></i>
            </div>
          </div>
        {/if}
        {#if song.representationId === null}
          <div class="btn btn-xs btn-success text-base uppercase no-animation">
            {$t('common.new')}
          </div>
        {/if}
      </div>
      <p class="truncate">
        <span class="badge mr-1">{$t('song.edition')}</span>
        {song.edition ?? $t(`song.edition_types.${song.editionType}`)}
      </p>
      <p class="truncate">
        <span class="badge mr-1">{$t('song.composer')}</span>
        {@html $composer}
      </p>
      <p class="truncate">
        <span class="badge mr-1">{$t('song.duration')}</span>
        {convertTime(song.duration, true)}
      </p>
      <div class="grow-0 flex items-center">
        <span class="badge mr-1">
          {$t(song.originalityProof ? 'common.owner' : 'song.uploader')}
        </span>
        {#if $uploader.isSuccess}
          <p class="truncate">
            {$uploader.data.data.userName}
          </p>
        {:else}
          <div class="skeleton w-2/3 h-6"></div>
        {/if}
      </div>
      <p class="truncate">
        <span class="badge mr-1">
          {$t('common.date_created')}
        </span>
        {parseDateTime(song.dateCreated, true, user?.language)}
      </p>
      {#if showDateUpdated}
        <p class="truncate">
          <span class="badge mr-1">
            {$t('common.date_updated')}
          </span>
          {parseDateTime(song.dateUpdated, true, user?.language)}
        </p>
      {/if}
    </div>
  </a>
</div>
