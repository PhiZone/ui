<script lang="ts">
  import type { ChartSubmissionDto } from '$lib/api/chart.submission';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getLevelColor, getUserPrivilege, parseDateTime } from '$lib/utils';
  import { page } from '$app/stores';
  import { createQuery } from '@tanstack/svelte-query';

  export let submission: ChartSubmissionDto;

  $: ({ user, api } = $page.data);

  $: song = createQuery(
    api.song.info({ id: submission.songId ?? '' }, { enabled: !!submission.songId }),
  );
  $: songSubmission = createQuery(
    api.song.submission.info(
      { id: submission.songSubmissionId ?? '' },
      { enabled: !!submission.songSubmissionId },
    ),
  );
  $: uploader = createQuery(api.user.info({ id: submission.ownerId }));
</script>

<a href={`/studio/chart-submissions/${submission.id}`}>
  <div
    class={`card min-w-[500px] card-side overflow-hidden ${
      submission.status === 1
        ? 'bg-success-content'
        : submission.status === 2
        ? 'bg-error-content'
        : (user && getUserPrivilege(user.role) < 3) || submission.dateVoted
        ? 'bg-base-100'
        : 'bg-warning-content'
    } shadow-lg hover:shadow-sm hover:shadow-primary-focus`}
  >
    <figure class="min-w-[30%] max-w-[30%]">
      <img
        class="object-cover w-full h-full"
        src={getCompressedImage(
          $song.isSuccess
            ? $song.data.data.illustration
            : $songSubmission.isSuccess
            ? $songSubmission.data.data.illustration
            : '',
        )}
        alt="Illustration"
      />
    </figure>
    <div class="card-body w-[70%] max-h-fit">
      <h2 class="card-title text-2xl mb-3 min-w-fit">
        {$song.isSuccess
          ? $song.data.data.title
          : $songSubmission.isSuccess
          ? $songSubmission.data.data.title
          : ''}
        <div class="join join-horizontal">
          <button
            class={`btn ${getLevelColor(
              submission.levelType,
            )} btn-sm join-item text-xl no-animation`}
          >
            {submission.level}
            {submission.difficulty != 0 ? Math.floor(submission.difficulty) : '?'}
          </button>
          {#if submission.isRanked}
            <button class="btn btn-success btn-sm join-item text-xl no-animation">
              {$t('chart.ranked')}
            </button>
          {/if}
        </div>
      </h2>
      <div class="flex items-center min-w-fit">
        <p class="w-1/2">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('studio.submission.overall_status')}
          </span>
          {$t(`studio.submission.statuses.${submission.status}`)}
        </p>
        <p class="w-1/2">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('studio.submission.volunteer_status')}
          </span>
          {$t(`studio.submission.bi_statuses.${submission.volunteerStatus}`)}
        </p>
      </div>
      <div class="flex items-center min-w-fit">
        <p class="w-1/2">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('studio.submission.adm_status')}
          </span>
          {$t(`studio.submission.bi_statuses.${submission.admissionStatus}`)}
        </p>
        {#if $uploader.isSuccess}
          {@const uploader = $uploader.data?.data}
          <p class="w-1/2">
            <span class="badge badge-primary badge-outline mr-1">
              {$t('studio.submission.uploader')}
            </span>
            {uploader.userName}
          </p>
        {/if}
      </div>
      <div class="flex items-center min-w-fit">
        <p class="w-1/2">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('common.created_at')}
          </span>
          {parseDateTime(submission.dateCreated)}
        </p>
        <p class="w-1/2">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('common.updated_at')}
          </span>
          {parseDateTime(submission.dateUpdated)}
        </p>
      </div>
    </div>
  </div>
</a>
