<script lang="ts">
  import { t } from '$lib/translations/config';
  import Song from '$lib/components/Song.svelte';
  import { richtext } from '$lib/richtext.js';
  import { getLevelColor, getUserPrivilege, parseDateTime } from '$lib/utils.js';
  import { createQuery } from '@tanstack/svelte-query';
  import VolunteerVote from '$lib/components/VolunteerVote.svelte';
  import { LEVEL_TYPES, Status } from '$lib/constants.js';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import Collaboration from '$lib/components/Collaboration.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import User from '$lib/components/User.svelte';

  export let data;
  $: ({ searchParams, id, user, api } = data);

  const {
    form: voteForm,
    enhance: voteEnhance,
    errors: voteErrors,
    message: voteMessage,
    submitting: voteSubmitting,
    allErrors: voteAllErrors,
  } = superForm(data.voteForm);

  const {
    form: collabForm,
    enhance: collabEnhance,
    errors: collabErrors,
    message: collabMessage,
    submitting: collabSubmitting,
    allErrors: collabAllErrors,
  } = superForm(data.collabForm);

  let score = 0;
  let queryCollaborator = false;
  let newCollaboratorId: number | null = null;
  let voteOpen = false;
  let collabOpen = false;

  $: collaborator = createQuery(
    api.user.info(
      { id: newCollaboratorId ?? 0 },
      { enabled: !!newCollaboratorId && queryCollaborator },
    ),
  );

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
  $: votes = createQuery(api.vote.volunteer.listAll({ chartId: id }));
  $: collaborations = createQuery(api.chart.submission.listAllCollaborations({ id }));

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
  <input
    type="checkbox"
    id="studio-chart-submission"
    class="modal-toggle"
    bind:checked={voteOpen}
  />
  <div class="modal">
    <div class="modal-box bg-base-100">
      <label
        for="studio-chart-submission"
        class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <h2 class="font-bold text-xl mb-4">{$t('common.vote_v')}</h2>
      <form
        id="vote"
        method="POST"
        class="form-control"
        action="?/vote"
        use:voteEnhance
        on:submit={() => {
          voteOpen = false;
        }}
      >
        <input type="text" id="chart_id" name="chartId" class="hidden" value={id} />
        <div class="flex min-w-full items-center">
          <input
            id="score"
            name="score"
            type="range"
            min="-3"
            max="3"
            bind:value={score}
            class="range min-w-auto"
            step="1"
          />
          <p class="w-8 text-right text-xl font-bold">{score}</p>
        </div>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$voteErrors.score}
          data-tip={$voteErrors.score}
        />
        <label class="join my-4">
          <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
            {$t('studio.submission.message')}
          </span>
          <textarea
            id="message"
            name="message"
            class="textarea textarea-secondary join-item w-full h-48"
            placeholder={$t('studio.submission.write_message')}
          />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$voteErrors.message}
          data-tip={$voteErrors.message}
        />
        <div class="modal-action">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={!!$voteMessage}
            data-tip={$voteMessage}
          >
            <button
              type="submit"
              class="btn {$voteAllErrors.length > 0
                ? 'btn-error'
                : $voteSubmitting
                ? 'btn-ghost'
                : 'btn-secondary btn-outline'} w-full"
              disabled={$voteSubmitting}
            >
              {$voteAllErrors.length > 0
                ? $t('common.error')
                : $voteSubmitting
                ? $t('common.waiting')
                : $t('common.submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <input type="checkbox" id="new-collaborator" class="modal-toggle" bind:checked={collabOpen} />
  <div class="modal">
    <div class="modal-box bg-base-100 form-control gap-3">
      <div class="flex gap-3 items-center">
        <h3 class="font-bold text-lg">{$t('studio.submission.add_collaborator')}</h3>
        {#if user}
          <p class="opacity-80">
            ({$t('studio.submission.your_id')}{$t('common.colon')}{user.id})
          </p>
        {/if}
      </div>
      <label
        for="new-collaborator"
        class="btn btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="collab"
        method="POST"
        class="w-full form-control"
        action="?/collab"
        use:collabEnhance
        on:submit={() => {
          collabOpen = false;
        }}
      >
        <input type="text" id="type" name="type" class="hidden" value="charts" />
        <input type="text" id="id" name="id" class="hidden" value={id} />
        <div
          class={$collaborator.isError
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2'
            : 'w-full my-2 px-4'}
          data-tip={$collaborator.isError ? $t(`error.${$collaborator.error.code}`) : ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('user.id')}</span>
            <input
              type="number"
              id="invitee_id"
              name="inviteeId"
              placeholder={$t('studio.submission.author_placeholder')}
              class={`input input-secondary join-item w-3/4 min-w-[180px] ${
                $collaborator.isError ? 'input-error' : 'input-secondary'
              }`}
              bind:value={newCollaboratorId}
              on:input={() => {
                queryCollaborator = false;
              }}
            />
            <button
              type="button"
              class={`btn join-item ${
                newCollaboratorId || $collaborator.isLoading
                  ? $collaborator.isError
                    ? 'btn-error'
                    : 'btn-secondary btn-outline'
                  : 'btn-disabled'
              }`}
              on:click={() => {
                queryCollaborator = true;
              }}
            >
              {$t('common.fetch')}
            </button>
          </label>
        </div>
        {#if newCollaboratorId && $collaborator.isSuccess}
          <User
            id={newCollaboratorId}
            initUser={$collaborator.data.data}
            kind="mini"
            target="_blank"
          />
          <label class="join w-full px-4">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.position')}
            </span>
            <input
              type="text"
              id="position"
              name="position"
              placeholder={$t('common.position')}
              class="input input-secondary join-item w-3/4"
            />
          </label>
          <div class="modal-action mt-3 px-4">
            <button type="submit" class="btn btn-secondary btn-outline">
              {$t('common.submit')}
            </button>
          </div>
        {/if}
      </form>
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
                [{LEVEL_TYPES[submission.levelType]}] {submission.level}
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
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.created_at')}
                </span>
                {parseDateTime(submission.dateCreated)}
              </p>
              <p>
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('studio.submission.updated_at')}
                </span>
                {parseDateTime(submission.dateUpdated)}
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
              {#if user && getUserPrivilege(user.role) >= 3}
                <label
                  for="studio-chart-submission"
                  class="btn btn-primary btn-outline text-lg w-32"
                >
                  {$t('common.vote_v')}
                </label>
              {/if}
              {#if $song.isSuccess || $songSubmission.isSuccess}
                {@const song = $song.data?.data ?? $songSubmission.data?.data}
                <a
                  href="{PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&mode=preview&chart={encodeURI(
                    submission.file,
                  )}&song={encodeURI(song?.file ?? '')}&illustration={encodeURI(
                    song?.illustration ?? '',
                  )}&name={submission.title ??
                    song?.title}&level={submission.level}&difficulty={submission.difficulty != 0
                    ? Math.floor(submission.difficulty)
                    : '?'}&composer={song?.authorName}&illustrator={song?.illustrator}&charter={submission.authorName}"
                  class="btn btn-primary btn-outline text-lg w-32"
                  target="_target"
                >
                  {$t('common.preview')}
                </a>
              {/if}
            </div>
          </div>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('common.collaborators')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body py-10">
            {#if user && (user.id === submission.ownerId || getUserPrivilege(user.role) === 6)}
              <label
                for="new-collaborator"
                class="btn btn-primary btn-outline btn-sm btn-circle absolute right-2 top-2 text-md"
              >
                ＋
              </label>
            {/if}
            {#if $collaborations.isLoading}
              <div />
            {:else if $collaborations.isSuccess}
              {#if $collaborations.data.data.length > 0}
                {#each $collaborations.data.data as collaboration}
                  <Collaboration {collaboration} kind="mini" showInvitee />
                {/each}
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
      {#if $votes.isSuccess}
        {@const votes = $votes.data.data}

        {#each votes as vote}
          <VolunteerVote {vote} />
        {/each}
      {/if}
    </div>
    <div class="mx-4 w-80 form-control">
      {#if user && getUserPrivilege(user.role) >= 3 && $uploader.isSuccess}
        <div class="indicator my-4 w-full">
          <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
            {$t('studio.submission.uploader')}
          </span>
          <User id={$uploader.data.data.id} initUser={$uploader.data.data} />
        </div>
      {/if}
      {#if $song.isSuccess}
        {@const song = $song.data.data}
        <div class="indicator my-4 w-full">
          <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .main-width {
    width: calc(min(100%, 880px) - 80px);
  }
</style>
