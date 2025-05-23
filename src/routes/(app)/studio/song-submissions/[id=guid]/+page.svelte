<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { readable } from 'svelte/store';
  import { superForm } from 'sveltekit-superforms';

  import type { SongMatchDto, SongSubmissionMatchDto } from '$lib/api/submission';

  import ChapterAdmission from '$lib/components/ChapterAdmission.svelte';
  import Collaboration from '$lib/components/Collaboration.svelte';
  import Delete from '$lib/components/Delete.svelte';
  import Download from '$lib/components/Download.svelte';
  import Error from '$lib/components/Error.svelte';
  import EventDivision from '$lib/components/EventDivision.svelte';
  import ResourceRecord from '$lib/components/ResourceRecord.svelte';
  import Service from '$lib/components/Service.svelte';
  import Song from '$lib/components/Song.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import User from '$lib/components/User.svelte';
  import { SONG_MATCH_SCORE_THRESHOLD } from '$lib/constants';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, getUserPrivilege, parseDateTime } from '$lib/utils';

  let { data } = $props();
  let { id, user, api } = $derived(data);

  interface SongMatch {
    type: 'song';
    payload: SongMatchDto;
  }

  interface SongSubmissionMatch {
    type: 'songSubmission';
    payload: SongSubmissionMatchDto;
  }

  const {
    enhance: reviewEnhance,
    errors: reviewErrors,
    message: reviewMessage,
    submitting: reviewSubmitting,
    allErrors: reviewAllErrors,
  } = superForm(data.reviewForm, {
    id: 'song-review',
  });

  const {
    enhance: collabEnhance,
    errors: collabErrors,
    message: collabMessage,
    submitting: collabSubmitting,
    allErrors: collabAllErrors,
  } = superForm(data.collabForm, {
    id: 'song-collab',
    onResult({ result }) {
      if (result.type == 'success') {
        collabOpen = false;
      }
    },
  });

  const {
    enhance: chapterEnhance,
    errors: chapterErrors,
    message: chapterMessage,
    submitting: chapterSubmitting,
    allErrors: chapterAllErrors,
  } = superForm(data.chapterForm, {
    id: 'song-chapter',
    onResult({ result }) {
      if (result.type == 'success') {
        chapterOpen = false;
      }
    },
  });

  let queryCollaborator = $state(false);
  let newCollaboratorId: number | null = $state(null);
  let queryChapter = $state(true);
  let newChapterSearch: string | undefined = $state();
  let newChapterId: string | null = $state(null);
  let reviewOpen = $state(false);
  let collabOpen = $state(false);
  let chapterOpen = $state(false);

  let submissionQuery = $derived(createQuery(api.song.submission.info({ id })));
  let uploader = $derived(
    createQuery(
      api.user.info(
        { id: $submissionQuery.data?.data.ownerId ?? 0 },
        { enabled: $submissionQuery.isSuccess },
      ),
    ),
  );
  let reviewerQuery = $derived(
    createQuery(
      api.user.info(
        { id: $submissionQuery.data?.data.reviewerId ?? 0 },
        { enabled: $submissionQuery.isSuccess && !!$submissionQuery.data?.data.reviewerId },
      ),
    ),
  );
  let representation = $derived(
    createQuery(
      api.song.info(
        { id: $submissionQuery.data?.data.representationId ?? '' },
        { enabled: $submissionQuery.isSuccess && !!$submissionQuery.data?.data.representationId },
      ),
    ),
  );
  let collaborator = $derived(
    createQuery(
      api.user.info(
        { id: newCollaboratorId ?? 0 },
        { enabled: !!newCollaboratorId && queryCollaborator },
      ),
    ),
  );
  let collaborations = $derived(createQuery(api.song.submission.listAllCollaborations({ id })));
  let chapterSearch = $derived(
    createQuery(api.chapter.listAll({ search: newChapterSearch }, { enabled: queryChapter })),
  );
  let chapters = $derived(
    createQuery(
      api.admission.listChapter(
        { rangeAdmitteeId: [$submissionQuery.data?.data.representationId ?? ''] },
        { enabled: $submissionQuery.isSuccess && !!$submissionQuery.data.data.representationId },
      ),
    ),
  );
  let servicesQuery = $derived(createQuery(api.service.list({ rangeTargetType: [0] })));

  let composer = $derived(
    $submissionQuery.data?.data.originalityProof
      ? richtext($submissionQuery.data?.data.authorName ?? '')
      : readable($submissionQuery.data?.data.authorName),
  );
  let composerText = $derived(
    $submissionQuery.data?.data.originalityProof && $submissionQuery.data?.data.authorName
      ? $submissionQuery.data?.data.authorName.replaceAll(
          /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
          (_, __, ___, display: string) => display,
        )
      : $submissionQuery.data?.data.authorName,
  );
  let eventParticipation = $derived(
    createQuery(
      api.chart.submission.checkEvent(
        {
          strings: $submissionQuery.data?.data.tags ?? [],
          userId: $submissionQuery.data?.data.ownerId ?? user.id,
        },
        { enabled: $submissionQuery.isSuccess, retry: 0 },
      ),
    ),
  );
  let eventQuery = $derived(
    createQuery(
      api.event.info(
        { id: $eventParticipation.data?.data.division?.eventId ?? '' },
        { enabled: $eventParticipation.isSuccess && !!$eventParticipation.data?.data.division },
      ),
    ),
  );
</script>

<svelte:head>
  <title>
    {$t('studio.song_submission')} - {$submissionQuery.data?.data.title} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if $submissionQuery.isSuccess}
  {@const submission = $submissionQuery.data.data}
  <input
    type="checkbox"
    id="studio-song-submission"
    class="modal-toggle"
    bind:checked={reviewOpen}
  />
  <div class="modal">
    <div class="modal-box bg-base-100">
      <label
        for="studio-song-submission"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h2 class="font-bold text-xl mb-4">{$t('common.reply_v')}</h2>
      <form
        id="review"
        class="form-control"
        method="POST"
        action="?/review"
        use:reviewEnhance
        onsubmit={() => {
          reviewOpen = false;
        }}
      >
        <input type="hidden" id="id" name="id" value={id} />
        <label class="flex flex-col my-2">
          <div class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
              {$t('common.status')}
            </span>
            <select
              id="status"
              name="status"
              class="select transition border-2 normal-border hover:select-primary join-item w-3/4"
              value="1"
            >
              <option value="1">{$t('studio.submission.statuses.1')}</option>
              <option value="2">{$t('studio.submission.statuses.2')}</option>
            </select>
          </div>
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$reviewErrors.status}
            data-tip={$reviewErrors.status}
          ></div>
        </label>
        <label class="join my-2">
          <p class="w-1/4">{$t('song.is_original')}</p>
          <input
            id="is_original"
            name="isOriginal"
            type="checkbox"
            class="toggle border-2 toggle-secondary"
          />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.isOriginal}
          data-tip={$reviewErrors.isOriginal}
        ></div>
        <label class="join my-2">
          <p class="w-1/4">{$t('common.is_hidden')}</p>
          <input
            id="is_hidden"
            name="isHidden"
            type="checkbox"
            class="toggle border-2 toggle-secondary"
          />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.isHidden}
          data-tip={$reviewErrors.isHidden}
        ></div>
        <label class="join my-2">
          <p class="w-1/4">{$t('common.is_locked')}</p>
          <input
            id="is_locked"
            name="isLocked"
            type="checkbox"
            class="toggle border-2 toggle-secondary"
          />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.isLocked}
          data-tip={$reviewErrors.isLocked}
        ></div>
        <div
          class={$reviewErrors.message
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
            : 'my-2'}
          data-tip={$reviewErrors.message}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
              {$t('common.reply')}
            </span>
            <textarea
              id="message"
              name="message"
              class="textarea transition border-2 normal-border hover:textarea-secondary join-item w-3/4 h-48"
              placeholder={$t('common.write_reply')}
            ></textarea>
          </label>
        </div>
        <div class="modal-action">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={!!$reviewMessage}
            data-tip={$reviewMessage}
          >
            <button
              type="submit"
              class="btn {$reviewAllErrors.length > 0
                ? 'btn-error'
                : $reviewSubmitting
                  ? 'btn-ghost'
                  : 'btn-outline border-2 normal-border'} w-full"
              disabled={$reviewSubmitting}
            >
              {$reviewAllErrors.length > 0
                ? $t('common.error')
                : $reviewSubmitting
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
      <h3 class="font-bold text-lg">{$t('studio.submission.add_collaborator')}</h3>
      <label
        for="new-collaborator"
        class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="collab"
        method="POST"
        class="w-full form-control gap-4"
        action="?/collab"
        use:collabEnhance
      >
        <input type="hidden" id="type" name="type" value="songs" />
        <input type="hidden" id="id" name="id" value={id} />
        <div
          class={$collaborator.isError
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full'
            : 'w-full'}
          data-tip={$collaborator.isError ? $t(`error.${$collaborator.error.code}`) : ''}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('user.id')}</span>
            <input
              type="number"
              id="invitee_id"
              name="inviteeId"
              placeholder={$t('studio.submission.author_placeholder')}
              class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                $collaborator.isError ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newCollaboratorId}
              oninput={() => {
                queryCollaborator = false;
              }}
            />
            <button
              type="button"
              class={`btn border-2 normal-border join-item ${
                newCollaboratorId || $collaborator.isLoading
                  ? $collaborator.isError
                    ? 'btn-error'
                    : 'hover:btn-secondary btn-outline'
                  : 'btn-disabled'
              }`}
              onclick={() => {
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
          <div
            class={$collabErrors.position
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
              : ''}
            data-tip={$collabErrors.position}
          >
            <label class="join w-full">
              <span class="btn no-animation join-item w-1/4 min-w-fit">
                {$t('common.position')}
              </span>
              <input
                type="text"
                id="position"
                name="position"
                placeholder={$t('common.position')}
                class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
              />
            </label>
          </div>
          <div class="modal-action mt-3">
            <div
              class="tooltip tooltip-bottom tooltip-error w-full"
              class:tooltip-open={!!$collabMessage}
              data-tip={$collabMessage}
            >
              <button
                type="submit"
                class="btn {$collabAllErrors.length > 0
                  ? 'btn-error'
                  : $collabSubmitting
                    ? 'btn-ghost'
                    : 'btn-outline border-2 normal-border'} w-full"
                disabled={$collabSubmitting}
              >
                {$collabAllErrors.length > 0
                  ? $t('common.error')
                  : $collabSubmitting
                    ? $t('common.waiting')
                    : $t('common.submit')}
              </button>
            </div>
          </div>
        {/if}
      </form>
    </div>
  </div>
  <input type="checkbox" id="new-chapter" class="modal-toggle" bind:checked={chapterOpen} />
  <div class="modal">
    <div class="modal-box bg-base-100 form-control gap-3 min-w-[40vw]">
      <h3 class="font-bold text-lg">{$t('studio.submission.add_chapter')}</h3>
      <label
        for="new-chapter"
        class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="chapter"
        method="POST"
        class="w-full form-control gap-4"
        action="?/chapter"
        use:chapterEnhance
      >
        <input type="hidden" id="id" name="id" value={submission.representationId} />
        <div
          class={$chapterSearch.isError
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full'
            : 'w-full'}
          data-tip={$chapterSearch.isError ? $t(`error.${$chapterSearch.error.code}`) : ''}
        >
          <label class="join w-full">
            <input
              type="text"
              placeholder={$t('common.search_placeholder', {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                resource: $t('common.chapters').toLowerCase(),
              })}
              class={`input transition border-2 normal-border w-5/6 join-item min-w-[180px] ${
                $chapterSearch.isError ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newChapterSearch}
              oninput={() => {
                queryChapter = false;
              }}
            />
            <button
              type="button"
              aria-label={$t('common.search')}
              class={`btn border-2 normal-border w-1/6 join-item ${
                !$chapterSearch.isLoading
                  ? $chapterSearch.isError
                    ? 'btn-error'
                    : 'hover:btn-secondary btn-outline'
                  : 'btn-disabled'
              }`}
              onclick={() => {
                queryChapter = true;
              }}
            >
              <i class="fa-solid fa-magnifying-glass fa-lg"></i>
            </button>
          </label>
        </div>
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-fit">
            {$t('common.chapters')}
          </span>
          <select
            id="admitter_id"
            name="admitterId"
            class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
            bind:value={newChapterId}
          >
            {#if $chapterSearch.isSuccess}
              {#each $chapterSearch.data.data as chapter}
                {#if [0, 1].includes(chapter.accessibility) || (user && chapter.ownerId === user.id)}
                  <option value={chapter.id}>
                    {chapter.title} - {chapter.subtitle}
                  </option>
                {/if}
              {/each}
            {/if}
          </select>
        </label>
        <div
          class={$chapterErrors.label ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$chapterErrors.label}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.label')}
            </span>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={$t('common.label')}
              class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
            />
          </label>
        </div>
        <div class="modal-action mt-3">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={!!$chapterMessage}
            data-tip={$chapterMessage}
          >
            <button
              type="submit"
              class="btn {$chapterAllErrors.length > 0
                ? 'btn-error'
                : $chapterSubmitting
                  ? 'btn-ghost'
                  : 'btn-outline border-2 normal-border'} w-full"
              disabled={$chapterSubmitting}
            >
              {$chapterAllErrors.length > 0
                ? $t('common.error')
                : $chapterSubmitting
                  ? $t('common.waiting')
                  : $t('common.submit')}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
  <div class="studio-info-page bg-base-300 min-h-screen py-24 px-12 justify-center flex">
    <div class="mx-4 max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('studio.song_submission')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              {#if submission.originalityProof}
                <button class="btn btn-accent text-3xl no-animation min-w-fit">
                  {$t('song.original')}
                </button>
              {/if}
              <h2 class="text-5xl font-bold content md:inline-block">
                {submission.title}
              </h2>
            </div>
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/3">
                <p>
                  <span class="badge mr-1">
                    {$t('song.title')}
                  </span>
                  {submission.title}
                </p>
                <p class="flex gap-1 items-center">
                  <span class="badge">
                    {$t('common.form.audio')}
                  </span>
                  <Download
                    file={submission.file}
                    name={`${composerText} - ${submission.title}${
                      submission.edition ? ` (${submission.edition})` : ''
                    }`}
                    class=""
                    inline
                  />
                </p>
                <p class="flex gap-1 items-center">
                  <span class="badge">
                    {$t('common.form.illustration')}
                  </span>
                  <Download
                    file={submission.illustration}
                    name={`${composerText} - ${submission.title}${
                      submission.edition ? ` (${submission.edition})` : ''
                    }`}
                    class=""
                    inline
                  />
                </p>
                {#if submission.license}
                  <p class="flex gap-1 items-center">
                    <span class="badge">
                      {$t('common.form.license')}
                    </span>
                    <Download
                      file={submission.license}
                      name={`${composerText} - ${submission.title}${
                        submission.edition ? ` (${submission.edition})` : ''
                      } - ${$t('common.form.license')}`}
                      class=""
                      inline
                    />
                  </p>
                {/if}
                {#if submission.originalityProof}
                  <p class="flex gap-1 items-center">
                    <span class="badge">
                      {$t('common.form.originality_proof')}
                    </span>
                    <Download
                      file={submission.originalityProof}
                      name={`${composerText} - ${submission.title}${
                        submission.edition ? ` (${submission.edition})` : ''
                      } - ${$t('common.form.originality_proof')}`}
                      class=""
                      inline
                    />
                  </p>
                {/if}
                <p>
                  <span class="badge mr-1">
                    {$t('song.edition')}
                  </span>
                  <btn class="btn btn-xs btn-shallow text-sm font-normal no-animation">
                    {$t(`song.edition_types.${submission.editionType}`)}
                  </btn>
                  {#if submission.edition}
                    {submission.edition}
                  {/if}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.form.composer')}
                  </span>
                  {@html $composer}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.form.illustrator')}
                  </span>
                  {submission.illustrator}
                </p>
                <p>
                  <span class="badge mr-1">{$t('song.bpm')}</span>
                  {#if submission.minBpm === submission.maxBpm}
                    {submission.bpm}
                  {:else}
                    {submission.minBpm} ~ {submission.maxBpm} ({submission.bpm})
                  {/if}
                </p>
                <p>
                  <span class="badge mr-1">{$t('song.offset')}</span>
                  {`${submission.offset} ms`}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('studio.submission.preview_start')}
                  </span>
                  {convertTime(submission.previewStart)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('studio.submission.preview_end')}
                  </span>
                  {convertTime(submission.previewEnd)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.date_created')}
                  </span>
                  {parseDateTime(submission.dateCreated)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.date_file_updated')}
                  </span>
                  {parseDateTime(submission.dateFileUpdated)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.date_updated')}
                  </span>
                  {parseDateTime(submission.dateUpdated)}
                </p>
                {#if submission.description}
                  <p class="content">
                    <span class="badge mr-1">
                      {$t('common.description')}
                    </span>
                    {submission.description}
                  </p>
                {/if}
                {#if submission.tags.length > 0}
                  <div class="inline-flex gap-1 flex-wrap">
                    <span class="badge">
                      {$t('common.tags')}
                    </span>
                    {#each submission.tags as tag}
                      <Tag {tag} />
                    {/each}
                  </div>
                {/if}
                <p>
                  <span class="badge mr-1">
                    {$t('common.status')}
                  </span>
                  {$t(`studio.submission.statuses.${submission.status}`)}
                </p>
                {#if $reviewerQuery.isSuccess}
                  {@const reviewer = $reviewerQuery.data.data}
                  <p>
                    <span class="badge mr-1">
                      {$t('studio.submission.reviewer')}
                    </span>
                    {reviewer.userName}
                  </p>
                {/if}
                {#if submission.message}
                  <p>
                    <span class="badge mr-1">
                      {$t('studio.submission.message')}
                    </span>
                    {submission.message}
                  </p>
                {/if}
              </div>
              <div class="md:w-2/3 flex flex-col justify-between gap-2">
                <div class="flex flex-col gap-2">
                  <img
                    src={submission.illustration}
                    class="h-fit rounded-lg transition border-2 normal-border hover:shadow-lg"
                    alt="Illustration"
                  />
                  <audio class="w-full" controls src={submission.file}></audio>
                </div>
                <div class="flex gap-2 items-center justify-end">
                  {#if user && (($uploader.isSuccess && $uploader.data.data.id === user.id) || getUserPrivilege(user.role) >= 4)}
                    <Delete
                      id={submission.id}
                      path="studio/songs"
                      name="studio.song_submission"
                      class="normal-border btn-outline text-lg btn-square"
                    />
                    <a
                      href="/studio/song-submissions/{submission?.id}/edit"
                      class="btn border-2 normal-border btn-outline text-lg w-32"
                    >
                      {$t('common.edit')}
                    </a>
                  {/if}
                  {#if getUserPrivilege(user.role) >= 4}
                    <label
                      for="studio-song-submission"
                      class="btn border-2 normal-border btn-outline text-lg w-32"
                    >
                      {$t('common.reply_v')}
                    </label>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {#if submission.recognitionSummary}
        {@const resourceRecordMatches = submission.recognitionSummary.resourceRecordMatches.filter(
          (match) => match.score >= SONG_MATCH_SCORE_THRESHOLD,
        )}
        {@const songMatches = (
          submission.recognitionSummary.songSubmissionMatches.map((match) => ({
            type: 'songSubmission',
            payload: match,
          })) as (SongMatch | SongSubmissionMatch)[]
        )
          .concat(
            submission.recognitionSummary.songMatches.map((match) => ({
              type: 'song',
              payload: match,
            })),
          )
          .filter((match) => match.payload.score >= SONG_MATCH_SCORE_THRESHOLD)
          .sort((a, b) => b.payload.score - a.payload.score)}
        {#if resourceRecordMatches.length > 0}
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('studio.session.potential_copyright_infringements')}
            </span>
            <div
              class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
            >
              <div class="card-body py-10 result">
                {#each resourceRecordMatches as resourceRecord}
                  <ResourceRecord {resourceRecord} />
                {/each}
              </div>
            </div>
          </div>
        {/if}
        {#if songMatches.length > 0}
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('studio.session.potential_song_duplicates')}
            </span>
            <div
              class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
            >
              <div class="card-body py-10 result">
                {#each songMatches as match}
                  {#if match.type === 'song'}
                    <Song song={match.payload} target="_blank" />
                  {:else}
                    <SongSubmission song={match.payload} target="_blank" showDateUpdated={false} />
                  {/if}
                {/each}
              </div>
            </div>
          </div>
        {/if}
      {/if}
      {#if submission.originalityProof}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.collaborators')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10">
              {#if user && (user.id === submission.ownerId || getUserPrivilege(user.role) === 6)}
                <label
                  for="new-collaborator"
                  class="btn border-2 normal-border btn-outline btn-sm btn-circle absolute right-2 top-2"
                >
                  <i class="fa-solid fa-plus fa-lg"></i>
                </label>
              {/if}
              {#if $collaborations.isLoading}
                <div></div>
              {:else if $collaborations.isSuccess}
                {#if $collaborations.data.data.length > 0}
                  <div class="flex flex-col gap-4">
                    {#each $collaborations.data.data as collaboration}
                      <Collaboration
                        {collaboration}
                        kind="mini"
                        editable={user &&
                          ((collaboration.inviterId === user.id &&
                            getUserPrivilege(user.role) >= 3) ||
                            (collaboration.inviterId !== user.id &&
                              getUserPrivilege(user.role) === 6))}
                        showInvitee
                      />
                    {/each}
                  </div>
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/if}
      {#if (submission.originalityProof || submission.license) && !!submission.representationId}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.submission.chapters')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10">
              {#if user && (user.id === submission.ownerId || getUserPrivilege(user.role) === 6)}
                <label
                  for="new-chapter"
                  class="btn border-2 normal-border btn-outline btn-sm btn-circle absolute right-2 top-2"
                >
                  <i class="fa-solid fa-plus fa-lg"></i>
                </label>
              {/if}
              {#if $chapters.isLoading}
                <div></div>
              {:else if $chapters.isSuccess}
                {#if $chapters.data.data.length > 0}
                  {#each $chapters.data.data as admission}
                    <ChapterAdmission
                      {admission}
                      editable={user &&
                        ((admission.requesterId === user.id && getUserPrivilege(user.role) >= 3) ||
                          (admission.requesterId !== user.id && getUserPrivilege(user.role) === 6))}
                      showSong={false}
                    />
                  {/each}
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {/if}
            </div>
          </div>
        </div>
      {/if}
      {#if $servicesQuery.isSuccess && $servicesQuery.data.data.length > 0}
        {@const services = $servicesQuery.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.services')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body pt-14 pb-10">
              <a
                class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
                href="/services?rangeTargetType=0&resourcePath=studio/songs&resourceId={id}"
              >
                {$t('common.more')}
                <i class="fa-solid fa-angles-right"></i>
              </a>
              <div class="result">
                {#each services as service}
                  <Service {service} resourcePath="studio/songs" resourceId={id} />
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="mx-auto lg:mx-4 w-80 form-control">
      {#if $uploader.isSuccess}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.submission.uploader')}
          </span>
          <User id={$uploader.data.data.id} initUser={$uploader.data.data} />
        </div>
      {/if}
      {#if $representation.isSuccess}
        {@const song = $representation.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
      {/if}
      {#if $eventParticipation.isSuccess}
        {@const participation = $eventParticipation.data.data}
        {#if participation.division && $eventQuery.isSuccess}
          {@const division = participation.division}
          {@const event = $eventQuery.data.data}
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('event.event')}
            </span>
            <EventDivision {division} {event} kind="full" />
          </div>
        {/if}
      {/if}
    </div>
  </div>
{:else if $submissionQuery.isError}
  <Error error={$submissionQuery.error} back="/studio/song-submissions" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
