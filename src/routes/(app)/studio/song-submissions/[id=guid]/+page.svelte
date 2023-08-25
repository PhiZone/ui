<script lang="ts">
  import { t } from '$lib/translations/config';
  import { getUserLevel, getUserPrivilege, parseDateTime } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';

  export let data;

  $: ({ searchParams, id, user, api } = data);

  $: submission = createQuery(api.song.submission.info({ id }));
  $: uploader = createQuery(
    api.user.info({ id: $submission.data?.data.ownerId ?? 0 }, { enabled: $submission.isSuccess }),
  );
  $: reviewer = createQuery(
    api.user.info(
      { id: $submission.data?.data.reviewerId ?? 0 },
      { enabled: $submission.isSuccess && !!$submission.data?.data.reviewerId },
    ),
  );
  $: representation = createQuery(
    api.song.info(
      { id: $submission.data?.data.representationId ?? '' },
      { enabled: $submission.isSuccess && !!$submission.data?.data.representationId },
    ),
  );
</script>

<svelte:head>
  <title>
    {$t('studio.song_submission')} - {$submission.data?.data.title} | {$t('common.title')}
  </title>
</svelte:head>

{#if $submission.isSuccess}
  {@const submission = $submission.data.data}
  <input type="checkbox" id="studio-song-submission" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100">
      <h3 class="font-bold text-lg">{$t('studio.submission.reply_v')}</h3>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="join my-2">
        <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
          {$t('studio.submission.status')}
        </span>
        <!-- <select bind:value={submissionStatus} class="select select-primary join-item w-3/4">
          <option value="1">{$t('studio.submission.volunteer_statuses.1')}</option>
          <option value="2">{$t('studio.submission.volunteer_statuses.2')}</option>
        </select>
      </label>
      <label class="join my-2">
        <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
          {$t('studio.submission.reply')}
        </span>
        <textarea
          class="textarea textarea-secondary join-item w-3/4 h-48"
          placeholder={$t('common.write_reply')}
          bind:value={reply}
        />
      </label>
      <div class="modal-action join join-horizontal">
        <label for="studio-song-submission" class="btn btn-primary btn-outline join-item text-lg">
          {$t('common.back')}
        </label>
        <label
          for="studio-song-submission"
          class="btn btn-primary btn-outline join-item text-lg"
          on:click={handleSubmit}
          on:keyup
        >
          {$t('common.submit')}
        </label>
      </div> -->
      </label>
    </div>
  </div>
  <div class="bg-base-200 min-h-screen py-24 px-12 justify-center flex">
    <div class="mx-4 min-w-[340px] max-w-7xl main-width">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('studio.song_submission')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body py-10">
            <div class="text-5xl py-3 flex font-bold gap-4 items-center">
              {submission.title}
            </div>
            <div>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.song_name')}
                </span>
                {submission.title}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.audio')}
                </span>
                <a
                  href={submission.file}
                  target="_blank"
                  rel="noreferrer"
                  class="hover:underline"
                  download
                >
                  {$t('common.download')}
                </a>
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.illustration')}
                </span>
                <a
                  href={submission.illustration}
                  target="_blank"
                  rel="noreferrer"
                  class="hover:underline"
                  download
                >
                  {$t('common.download')}
                </a>
              </p>
              {#if submission.license}
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('common.form.license')}
                  </span>
                  <a
                    href={submission.license}
                    target="_blank"
                    rel="noreferrer"
                    class="hover:underline"
                    download
                  >
                    {$t('common.download')}
                  </a>
                </p>
              {/if}
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('song.edition')}
                </span>
                <btn class="btn btn-xs btn-neutral text-sm font-normal no-animation">
                  {$t(`song.edition_types.${submission.editionType}`)}
                </btn>
                {#if submission.edition}
                  {submission.edition}
                {/if}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.composer')}
                </span>
                {submission.authorName}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.illustrator')}
                </span>
                {submission.illustrator}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('song.bpm')}</span>
                {#if submission.minBpm === submission.maxBpm}
                  {submission.bpm}
                {:else}
                  {submission.minBpm} ~ {submission.maxBpm} ({submission.bpm})
                {/if}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('song.offset')}</span>
                {`${submission.offset}ms`}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.preview_start')}
                </span>
                {submission.previewStart.replace(/^00:/, '')}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.preview_end')}
                </span>
                {submission.previewEnd.replace(/^00:/, '')}
              </p>
              {#if user && getUserPrivilege(user.role) >= 3 && $uploader.isSuccess}
                {@const uploader = $uploader.data.data}
                <p class="min-w-fit">
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('studio.submission.uploader')}
                  </span>
                  {uploader.userName}
                </p>
              {/if}
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.uploaded_at')}
                </span>
                {parseDateTime(submission.dateCreated)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.status')}
                </span>
                {$t(`studio.submission.volunteer_statuses.${submission.status}`)}
              </p>
              {#if $reviewer.isSuccess}
                {@const reviewer = $reviewer.data.data}
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('studio.submission.reviewer')}
                  </span>
                  {reviewer.userName}
                </p>
              {/if}
              {#if submission.message}
                <p>
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('studio.submission.reply')}
                  </span>
                  {submission.message}
                </p>
              {/if}
              {#if submission.description}
                <p class="submission">
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('common.description')}
                  </span>
                  {submission.description}
                </p>
              {/if}
            </div>
            <audio class="w-full" controls src={submission.file} />
            <div class="card-actions flex items-center justify-end">
              {#if user && (($uploader.isSuccess && $uploader.data.data.id === user.id) || getUserPrivilege(user.role) >= 3)}
                <a
                  href="/studio/song-submissions/${submission?.id}/edit"
                  class="btn btn-primary btn-outline text-lg w-32"
                >
                  {$t('common.edit')}
                </a>
              {/if}
              {#if user && getUserPrivilege(user.role) >= 3}
                <label
                  for="studio-song-submission"
                  class="btn btn-primary btn-outline text-lg w-32"
                >
                  {$t('studio.submission.reply_v')}
                </label>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .main-width {
    width: calc(min(100%, 880px) - 80px);
  }
</style>
