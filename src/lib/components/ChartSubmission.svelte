<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import type { ChartSubmissionDto } from '$lib/api';

  import { page } from '$app/state';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, parseDateTime } from '$lib/utils';

  import ChartLabel from './ChartDifficulty.svelte';

  let { user, api } = $derived(page.data);

  interface Props {
    chart: ChartSubmissionDto;
  }
  let { chart }: Props = $props();

  let charter = $derived(richtext(chart.authorName ?? ''));
  let uploader = $derived(createQuery(api.user.info({ id: chart.ownerId })));
</script>

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <a href={`/studio/chart-submissions/${chart.id}`}>
    <figure class="h-[167px] relative">
      <img
        src={getCompressedImage(
          chart.illustration ?? chart.song?.illustration ?? chart.songSubmission?.illustration,
        )}
        alt="Illustration"
        class="object-fill"
      />
      <div class="absolute bottom-2 left-2 w-fit h-fit">
        <ChartLabel {chart} />
      </div>
    </figure>
    <div class="card-body py-6 gap-0.5">
      <div class="flex gap-2 mb-1 items-center">
        <h2 class="title truncate">
          {chart.title ?? chart.song?.title ?? chart.songSubmission?.title}
        </h2>
        {#if chart.status === 1}
          <div
            class="flex items-center tooltip tooltip-right tooltip-success"
            data-tip={$t('studio.submission.statuses.1')}
          >
            <div class="btn btn-xs btn-circle btn-success no-animation">
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
        {:else if chart.status === 2}
          <div
            class="flex items-center tooltip tooltip-right tooltip-error"
            data-tip={$t('studio.submission.statuses.2')}
          >
            <div class="btn btn-xs btn-circle btn-error no-animation">
              <i class="fa-solid fa-xmark"></i>
            </div>
          </div>
        {:else if !chart.dateVoted || new Date(chart.dateVoted) < new Date(chart.dateFileUpdated)}
          <div
            class="flex items-center tooltip tooltip-right tooltip-warning"
            data-tip={$t('studio.submission.statuses.0')}
          >
            <div class="btn btn-xs btn-circle btn-warning no-animation">
              <i class="fa-solid fa-exclamation"></i>
            </div>
          </div>
        {/if}
        {#if chart.representationId === null}
          <div class="btn btn-xs btn-success text-base uppercase no-animation">
            {$t('common.new')}
          </div>
        {/if}
      </div>
      <p class="truncate">
        <span class="badge mr-1">{$t('chart.charter')}</span>
        {#if chart.authorName}
          {@html $charter}
        {:else}
          {$t('common.anonymous')}
        {/if}
      </p>
      <div class="grow-0 flex items-center">
        <span class="badge mr-1">{$t('common.owner')}</span>
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
          {$t('studio.submission.volunteer_status')}
        </span>
        {$t(`studio.submission.statuses.${chart.volunteerStatus}`)}
      </p>
      <p class="truncate">
        <span class="badge mr-1">
          {$t('studio.submission.admission_status')}
        </span>
        {$t(`studio.submission.statuses.${chart.admissionStatus}`)}
      </p>
      <p class="truncate">
        <span class="badge mr-1">
          {$t('common.date_created')}
        </span>
        {parseDateTime(chart.dateCreated, true, user?.language)}
      </p>
      <p class="truncate">
        <span class="badge mr-1">
          {$t('common.date_updated')}
        </span>
        {parseDateTime(chart.dateUpdated, true, user?.language)}
      </p>
    </div>
  </a>
</div>
