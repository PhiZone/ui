<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, parseDateTime } from '$lib/utils';
  import { page } from '$app/stores';
  import type { SongSubmissionDto } from '$lib/api/song.submission';

  export let submission: SongSubmissionDto;

  $: ({ api } = $page.data);

  $: uploader = createQuery(api.user.info({ id: submission.ownerId }));
</script>

<a href={`/studio/song-submissions/${submission.id}`}>
  <div
    class={`card min-w-[500px] card-side overflow-hidden ${
      submission.status === 1
        ? 'bg-success-content'
        : submission.status === 2
        ? 'bg-error-content'
        : 'bg-base-100'
    } shadow-lg hover:shadow-sm hover:shadow-primary-focus`}
  >
    <figure class="min-w-[30%] max-w-[30%]">
      <img
        class="object-cover w-full h-full"
        src={submission.illustration}
        alt="Illustration"
      />
    </figure>
    <div class="card-body w-[70%] max-h-fit">
      <h2 class="card-title text-2xl mb-3 min-w-fit">
        {submission.title}
      </h2>
      <div class="flex items-center min-w-fit">
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('studio.submission.status')}
          </span>
          {$t(`studio.submission.volunteer_statuses.${submission.status}`)}
        </p>
      </div>
      {#if submission.message}
        <div class="flex items-center min-w-fit">
          <p class="min-w-fit">
            <span class="badge badge-primary badge-outline mr-1">
              {$t('studio.submission.message')}
            </span>
            {submission.message}
          </p>
        </div>
      {/if}
      <div class="flex items-center min-w-fit">
        <p class="min-w-fit">
          {#if $uploader.isSuccess}
            {@const uploader = $uploader.data?.data}
            <span class="badge badge-primary badge-outline mr-1">
              {$t('studio.submission.uploader')}
            </span>
            {uploader.userName}
          {/if}
        </p>
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('studio.submission.uploaded_at')}
          </span>
          {parseDateTime(submission.dateCreated)}
        </p>
      </div>
    </div>
  </div>
</a>
