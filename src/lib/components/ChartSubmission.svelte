<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import type { ChartSubmissionDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getLevelColor, parseDateTime } from '$lib/utils';
  import { richtext } from '$lib/richtext';

  $: ({ api } = $page.data);

  export let chart: ChartSubmissionDto;

  $: song = createQuery(api.song.info({ id: chart.songId ?? '' }, { enabled: !!chart.songId }));
  $: songSubmission = createQuery(
    api.song.submission.info(
      { id: chart.songSubmissionId ?? '' },
      { enabled: !!chart.songSubmissionId },
    ),
  );
  $: charter = richtext(chart.authorName ?? '');
  $: uploader = createQuery(api.user.info({ id: chart.ownerId }));
</script>

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 border-gray-700 hover:border-primary hover:shadow-lg"
>
  <a href={`/studio/chart-submissions/${chart.id}`}>
    <figure class="h-[167px] relative">
      {#if chart.illustration || $song.isSuccess || $songSubmission.isSuccess}
        <img
          src={getCompressedImage(
            chart.illustration ??
              ($song.isSuccess
                ? $song.data.data.illustration
                : $songSubmission.isSuccess
                  ? $songSubmission.data.data.illustration
                  : undefined),
          )}
          alt="Illustration"
          class="object-fill"
        />
      {:else}
        <div class="skeleton rounded-none w-full h-full"></div>
      {/if}
      <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
        <div class="join join-horizontal">
          <button
            class={`btn ${getLevelColor(chart.levelType)} btn-sm join-item text-xl no-animation`}
          >
            {chart.level}
            {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
          </button>
          {#if chart.isRanked}
            <button class="btn btn-success btn-sm join-item text-xl no-animation">
              {$t('chart.ranked')}
            </button>
          {/if}
        </div>
      </div>
    </figure>
    <div class="card-body py-6 gap-0.5">
      <div class="flex gap-2 mb-1 items-center">
        {#if chart.title || $song.isSuccess || $songSubmission.isSuccess}
          <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
            {chart.title ??
              ($song.isSuccess
                ? $song.data.data.title
                : $songSubmission.isSuccess
                  ? $songSubmission.data.data.title
                  : undefined)}
          </h2>
        {:else}
          <div class="skeleton h-7"></div>
        {/if}
        {#if chart.status === 1}
          <div
            class="tooltip tooltip-right tooltip-success"
            data-tip={$t('studio.submission.statuses.1')}
          >
            <button class="btn btn-xs btn-circle btn-success no-animation">
              <i class="fa-solid fa-check"></i>
            </button>
          </div>
        {:else if chart.status === 2}
          <div
            class="tooltip tooltip-right tooltip-error"
            data-tip={$t('studio.submission.statuses.2')}
          >
            <button class="btn btn-xs btn-circle btn-error no-animation">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        {:else if !chart.dateVoted}
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
        <span class="badge mr-1">{$t('chart.charter')}</span>
        {#if chart.authorName}
          {@html $charter}
        {:else}
          {$t('common.anonymous')}
        {/if}
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
          {$t('studio.submission.volunteer_status')}
        </span>
        {$t(`studio.submission.statuses.${chart.volunteerStatus}`)}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">
          {$t('studio.submission.adm_status')}
        </span>
        {$t(`studio.submission.statuses.${chart.admissionStatus}`)}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">
          {$t('common.created_at')}
        </span>
        {parseDateTime(chart.dateCreated)}
      </p>
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">
          {$t('common.updated_at')}
        </span>
        {parseDateTime(chart.dateUpdated)}
      </p>
    </div>
  </a>
</div>

<style>
  .ellipsis-2-md {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 640px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .ellipsis-2-lg {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 1024px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
