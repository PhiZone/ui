<script lang="ts">
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import { goto, preloadData } from '$app/navigation';
  import { richtext } from '$lib/richtext.js';
  import { getLevelColor, getUserPrivilege, parseDateTime } from '$lib/utils.js';
  import { createQuery } from '@tanstack/svelte-query';

  export let data;
  $: ({ searchParams, id, user, api } = data);

  let score = 0,
    message: string;

  const levelTypes = ['EZ', 'HD', 'IN', 'AT', 'SP'];

  $: submission = createQuery(api.chart.submission.info({ id }));
  $: song = createQuery(
    api.song.info(
      { id: $submission.data?.data.songId ?? '' },
      { enabled: $submission.isSuccess && !!$submission.data.data.songId },
    ),
  );
  $: songSubmission = createQuery(
    api.song.submission.info(
      { id: $submission.data?.data.songSubmissionId ?? '' },
      { enabled: $submission.isSuccess && !!$submission.data.data.songSubmissionId },
    ),
  );
  $: uploader = createQuery(
    api.user.info({ id: $submission.data?.data.ownerId ?? 0 }, { enabled: $submission.isSuccess }),
  );
  // $: votes = createQuery(api.volunteerVote.listAll({ chartId: id }));

  $: charter = richtext($submission.data?.data.authorName ?? '');
</script>

<svelte:head>
  <title>
    {$t('studio.chart_submission')} - {$song.isSuccess
      ? $song.data.data.title
      : $songSubmission.isSuccess
      ? $songSubmission.data.data.title
      : ''}
    {$submission.isSuccess
      ? `[${$submission.data.data.level} ${
          $submission.data.data.difficulty != 0 ? Math.floor($submission.data.data.difficulty) : '?'
        }]`
      : ''} | {$t('common.title')}
  </title>
</svelte:head>

{#if $submission.isSuccess}
  {@const submission = $submission.data.data}
  <input type="checkbox" id="studio-chart-submission" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100">
      <h3 class="font-bold text-lg">{$t('common.vote_v')}</h3>
      <div class="flex min-w-full items-center">
        <input type="range" min="-3" max="3" bind:value={score} class="range min-w-auto" step="1" />
        <p class="w-8 text-right text-xl font-bold">{score}</p>
      </div>
      <label class="join my-2">
        <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
          {$t('studio.submission.message')}
        </span>
        <textarea
          class="textarea textarea-secondary join-item w-full h-48"
          placeholder={$t('studio.submission.write_message')}
          bind:value={message}
        />
      </label>
      <div class="modal-action join join-horizontal">
        <label for="studio-chart-submission" class="btn btn-primary btn-outline join-item text-lg">
          {$t('common.back')}
        </label>
        <!-- <label
          for="studio-chart-submission"
          class="btn btn-primary btn-outline join-item text-lg"
          on:click={handleSubmit}
          on:keyup
        >
          {$t('common.submit')}
        </label> -->
      </div>
    </div>
  </div>
  <div class="bg-base-200 min-h-screen py-24 px-12 justify-center flex">
    <div class="mx-4 min-w-[340px] max-w-7xl main-width">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('studio.chart_submission')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body py-10">
            <div class="text-5xl py-3 flex font-bold gap-4 items-center">
              {#if $song.isSuccess}
                <a
                  class="hover:underline"
                  href={`/songs/${$song.data.data.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {$song.data.data.title}
                </a>
              {:else if $songSubmission.isSuccess}
                <a
                  class="hover:underline"
                  href={`/studio/song-submissions/${$songSubmission.data.data.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {$songSubmission.data.data.title}
                </a>
              {/if}
              <button
                class={`btn ${getLevelColor(submission.levelType)} btn-sm text-2xl no-animation`}
              >
                {submission.level}
                {submission.difficulty != 0 ? Math.floor(submission.difficulty) : '?'}
              </button>
            </div>
            <div>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.chart_level')}
                </span>
                [{levelTypes[submission.levelType]}] {submission.level}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.chart_difficulty_2')}
                </span>
                {submission.difficulty.toFixed(1)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.form.chart')}
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
                <span class="badge badge-primary badge-outline mr-1">{$t('chart.charter')}</span>
                {#if submission.authorName}
                  {@html $charter}
                {:else}
                  {$t('common.anonymous')}
                {/if}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">{$t('chart.notes')}</span>
                {submission.noteCount}
              </p>
              {#if user && getUserPrivilege(user.role) >= 3 && $uploader.isSuccess}
                <p class="min-w-fit">
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('studio.submission.uploader')}
                  </span>
                  {$uploader.data.data.userName}
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
                  {$t('studio.submission.adm_status')}
                </span>
                {$t(`studio.submission.bi_statuses.${submission.admissionStatus}`)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.volunteer_status')}
                </span>
                {$t(`studio.submission.bi_statuses.${submission.volunteerStatus}`)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.overall_status')}
                </span>
                {$t(`studio.submission.statuses.${submission.status}`)}
              </p>
              {#if submission.description}
                <p class="content">
                  <span class="badge badge-primary badge-outline mr-1">
                    {$t('chart.description')}
                  </span>
                  {submission.description}
                </p>
              {/if}
            </div>
            <div class="card-actions flex items-center justify-end gap-2">
              {#if user && (($uploader.isSuccess && submission.ownerId === user.id) || getUserPrivilege(user.role) >= 3)}
                <a
                  href="/studio/chart-submissions/${submission.id}/edit"
                  class="btn btn-primary btn-outline text-lg w-32"
                >
                  {$t('common.edit')}
                </a>
              {/if}
              {#if user && getUserPrivilege(user.role) >= 3}
                <label
                  for="studio-chart-submission"
                  class="btn btn-primary btn-outline text-lg w-32"
                >
                  {$t('common.vote_v')}
                </label>
              {/if}
            </div>
          </div>
        </div>
      </div>
      <!-- {#each submission.votes as vote}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
          >
            {$t('studio.submission.volunteer_vote')}
          </span>
          <div class="card card-side w-full bg-base-100 border border-base-300 shadow-lg">
            <figure class="w-1/6 min-w-fit">
              <div
                class="relative inline-flex items-center justify-center form-control border-r border-base-300 px-3 py-3 mx-auto my-auto"
              >
                <p class="opacity-80">{$t('studio.submission.score')}</p>
                <p class="text-4xl font-extrabold">
                  {vote.value}
                </p>
              </div>
            </figure>
            <div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
              <p class="w-full content text-lg">
                {vote.message}
              </p>
              <div class="w-full mt-4 flex justify-between items-center">
                <p class="text-base opacity-70">
                  {#if vote.id}
                    #{vote.id}
                  {/if}
                </p>
                <p class="text-sm opacity-70 text-right">
                  {#if vote.user}
                    <a
                      href={`/users/${vote.user.id}`}
                      target="_blank"
                      rel="noreferrer"
                      class="hover:underline"
                    >
                      {vote.user.username}
                    </a>
                    @
                  {/if}
                  {parseDateTime(vote.time)}
                </p>
              </div>
            </div>
          </div>
        </div>
      {/each} -->
    </div>
    {#if $song.isSuccess}
      {@const song = $song.data.data}
      <div class="mx-4 w-80 form-control">
        <div class="indicator my-4 w-full">
          <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .main-width {
    width: calc(min(100%, 880px) - 80px);
  }
</style>
