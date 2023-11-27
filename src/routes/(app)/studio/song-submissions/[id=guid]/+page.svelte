<script lang="ts">
  import { t } from '$lib/translations/config';
  import { convertTime, getUserPrivilege, parseDateTime } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Collaboration from '$lib/components/Collaboration.svelte';
  import User from '$lib/components/User.svelte';
  import Song from '$lib/components/Song.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { richtext } from '$lib/richtext';
  import { readable } from 'svelte/store';
  import ResourceRecord from '$lib/components/ResourceRecord.svelte';

  export let data;

  $: ({ id, user, api } = data);

  const {
    // form: reviewForm,
    enhance: reviewEnhance,
    errors: reviewErrors,
    message: reviewMessage,
    submitting: reviewSubmitting,
    allErrors: reviewAllErrors,
  } = superForm(data.reviewForm, {
    id: 'song-review',
  });

  const {
    // form: collabForm,
    enhance: collabEnhance,
    // errors: collabErrors,
    // message: collabMessage,
    // submitting: collabSubmitting,
    // allErrors: collabAllErrors,
  } = superForm(data.collabForm, {
    id: 'song-collab',
  });

  let queryCollaborator = false;
  let newCollaboratorId: number | null = null;
  let reviewOpen = false;
  let collabOpen = false;

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
  $: resourceRecords = createQuery(
    api.resourceRecord.listAll(
      {
        equalsTitle: $submission.data?.data.title,
        equalsAuthorName: $submission.data?.data.authorName,
        rangeEditionType: $submission.data ? [$submission.data.data.editionType] : undefined,
        containsEdition: $submission.data?.data.edition ?? undefined,
        rangeStrategy: [1, 2, 3, 4],
      },
      { enabled: $submission.isSuccess },
    ),
  );
  $: collaborator = createQuery(
    api.user.info(
      { id: newCollaboratorId ?? 0 },
      { enabled: !!newCollaboratorId && queryCollaborator },
    ),
  );
  $: collaborations = createQuery(api.song.submission.listAllCollaborations({ id }));

  $: composer = $submission.data?.data.originalityProof
    ? richtext($submission.data?.data.authorName ?? '')
    : readable($submission.data?.data.authorName);
</script>

<svelte:head>
  <title>
    {$t('studio.song_submission')} - {$submission.data?.data.title} | {$t('common.title')}
  </title>
</svelte:head>

{#if $submission.isSuccess}
  {@const submission = $submission.data.data}
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
        class="btn btn-sm btn-primary btn-outline btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <h2 class="font-bold text-xl mb-4">{$t('studio.submission.reply_v')}</h2>
      <form
        id="review"
        class="form-control"
        method="POST"
        action="?/review"
        use:reviewEnhance
        on:submit={() => {
          reviewOpen = false;
        }}
      >
        <input type="hidden" id="id" name="id" value={id} />
        <label class="flex flex-col my-2">
          <div class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
              {$t('studio.submission.status')}
            </span>
            <select
              id="status"
              name="status"
              class="select select-primary join-item w-3/4"
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
          />
        </label>
        <label class="join my-2">
          <p class="w-1/4">{$t('studio.submission.is_original')}</p>
          <input id="is_original" name="isOriginal" type="checkbox" class="toggle" />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.isOriginal}
          data-tip={$reviewErrors.isOriginal}
        />
        <label class="join my-2">
          <p class="w-1/4">{$t('studio.submission.is_hidden')}</p>
          <input id="is_hidden" name="isHidden" type="checkbox" class="toggle" />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.isHidden}
          data-tip={$reviewErrors.isHidden}
        />
        <label class="join my-2">
          <p class="w-1/4">{$t('studio.submission.is_locked')}</p>
          <input id="is_locked" name="isLocked" type="checkbox" class="toggle" />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.isLocked}
          data-tip={$reviewErrors.isLocked}
        />
        <label class="join my-2">
          <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
            {$t('studio.submission.reply')}
          </span>
          <textarea
            id="message"
            name="message"
            class="textarea textarea-secondary join-item w-3/4 h-48"
            placeholder={$t('common.write_reply')}
          />
        </label>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$reviewErrors.message}
          data-tip={$reviewErrors.message}
        />
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
                  : 'btn-secondary btn-outline'} w-full"
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
        <input type="hidden" id="type" name="type" value="songs" />
        <input type="hidden" id="id" name="id" value={id} />
        <div
          class={$collaborator.isError
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2 px-4'
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
  <div class="studio-info-page bg-base-300 min-h-screen py-24 px-12 justify-center flex">
    <div class="mx-4 max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('studio.song_submission')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              <h2 class="text-5xl font-bold content md:inline-block">
                {submission.title}
              </h2>
              {#if submission.originalityProof}
                <button class="btn btn-secondary text-3xl no-animation min-w-fit">
                  {$t('song.original')}
                </button>
              {/if}
            </div>
            <div class="flex flex-col md:flex-row">
              <div class="md:w-1/3">
                <p>
                  <span class="badge mr-1">
                    {$t('common.form.song_title')}
                  </span>
                  {submission.title}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.form.audio')}
                  </span>
                  <a
                    href={submission.file}
                    target="_blank"
                    rel="noreferrer"
                    class="hover:underline min-w-fit"
                    download={submission.file?.split('/').pop()}
                  >
                    {$t('common.download')}
                  </a>
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.form.illustration')}
                  </span>
                  <a
                    href={submission.illustration}
                    target="_blank"
                    rel="noreferrer"
                    class="hover:underline min-w-fit"
                    download={submission.illustration?.split('/').pop()}
                  >
                    {$t('common.download')}
                  </a>
                </p>
                {#if submission.license}
                  <p>
                    <span class="badge mr-1">
                      {$t('common.form.license')}
                    </span>
                    <a
                      href={submission.license}
                      target="_blank"
                      rel="noreferrer"
                      class="hover:underline min-w-fit"
                      download={submission.license.split('/').pop()}
                    >
                      {$t('common.download')}
                    </a>
                  </p>
                {/if}
                {#if submission.originalityProof}
                  <p>
                    <span class="badge mr-1">
                      {$t('common.form.originality_proof')}
                    </span>
                    <a
                      href={submission.originalityProof}
                      target="_blank"
                      rel="noreferrer"
                      class="hover:underline min-w-fit"
                      download={submission.originalityProof.split('/').pop()}
                    >
                      {$t('common.download')}
                    </a>
                  </p>
                {/if}
                <p>
                  <span class="badge mr-1">
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
                    {$t('common.created_at')}
                  </span>
                  {parseDateTime(submission.dateCreated)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.updated_at')}
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
                <p>
                  <span class="badge mr-1">
                    {$t('studio.submission.status')}
                  </span>
                  {$t(`studio.submission.statuses.${submission.status}`)}
                </p>
                {#if $reviewer.isSuccess}
                  {@const reviewer = $reviewer.data.data}
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
              <div class="md:w-2/3 flex flex-col justify-between">
                <img
                  src={submission.illustration}
                  class="h-fit rounded-lg shadow-2xl my-2"
                  alt="Illustration"
                />
                <div class="flex flex-col gap-2">
                  <audio class="w-full" controls src={submission.file} />
                  <div class="flex gap-2 items-center justify-end">
                    {#if user && (($uploader.isSuccess && $uploader.data.data.id === user.id) || getUserPrivilege(user.role) >= 4)}
                      <a
                        href="/studio/song-submissions/{submission?.id}/edit"
                        class="btn btn-primary btn-outline text-lg w-32"
                      >
                        {$t('common.edit')}
                      </a>
                    {/if}
                    {#if user && getUserPrivilege(user.role) >= 4}
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
      </div>
      {#if submission.originalityProof}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.collaborators')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
          >
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
      {/if}
      {#if $resourceRecords.isSuccess && $resourceRecords.data.data.length > 0}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.submission.copyright_alert')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10 result">
              {#each $resourceRecords.data.data as resourceRecord}
                <ResourceRecord {resourceRecord} />
              {/each}
            </div>
          </div>
        </div>
      {/if}
    </div>
    <div class="mx-auto lg:mx-4 w-80 form-control">
      {#if $uploader.isSuccess}
        <div class="indicator my-4 w-full">
          <span
            class="indicator-item badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.submission.uploader')}
          </span>
          <User id={$uploader.data.data.id} initUser={$uploader.data.data} />
        </div>
      {/if}
      {#if $representation.isSuccess}
        <Song song={$representation.data.data} />
      {/if}
    </div>
  </div>
{/if}
