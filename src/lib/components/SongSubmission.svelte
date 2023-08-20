<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import type { SongSubmission } from '$lib/api';
  import { getCompressedImage, parseDateTime } from '$lib/utils';
  import { page } from '$app/stores';

  export let submission: SongSubmission;

  $: ({ api } = $page.data);

  $: uploader = createQuery(api.user.info({ id: submission.uploader }));
</script>

<a href={`/studio/song-submissions/${submission.id}`}>
  <div
    class={`card min-w-[500px] card-side overflow-hidden ${
      submission.status === 1
        ? 'bg-green-100'
        : submission.status === 2
        ? 'bg-red-100'
        : 'bg-base-100'
    } shadow-lg glass`}
  >
    <figure class="min-w-[30%] max-w-[30%]">
      <img
        class="object-cover w-full h-full"
        src={getCompressedImage(submission.illustration)}
        alt="Illustration"
      />
    </figure>
    <div class="card-body w-[70%] max-h-fit">
      <h2 class="card-title text-2xl mb-3 min-w-fit">
        {submission.name}
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
        {#if typeof submission.uploader === 'object'}
          <p class="min-w-fit">
            {#if $uploader.isSuccess}
              {@const uploader = $uploader.data}
              <span class="badge badge-primary badge-outline mr-1">
                {$t('studio.submission.uploader')}
              </span>
              {uploader.username}
            {/if}
          </p>
        {/if}
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('studio.submission.uploaded_at')}
          </span>
          {parseDateTime(submission.time)}
        </p>
      </div>
    </div>
  </div>
</a>
