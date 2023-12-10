<script lang="ts">
  import { t } from '$lib/translations/config';
  import { richtext } from '$lib/richtext';
  import { getLevelColor, getUserPrivilege, parseDateTime } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import VolunteerVote from '$lib/components/VolunteerVote.svelte';
  import { LEVEL_TYPES } from '$lib/constants';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import Collaboration from '$lib/components/Collaboration.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import User from '$lib/components/User.svelte';
  import Song from '$lib/components/Song.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import CollectionAdmission from '$lib/components/CollectionAdmission.svelte';

  export let data;
  $: ({ id, user, api } = data);

  const {
    enhance: voteEnhance,
    errors: voteErrors,
    message: voteMessage,
    submitting: voteSubmitting,
    allErrors: voteAllErrors,
  } = superForm(data.voteForm, {
    id: 'chart-vote',
  });

  const { enhance: collabEnhance } = superForm(data.collabForm, {
    id: 'chart-collab',
  });

  const { enhance: collectionEnhance } = superForm(data.collabForm, {
    id: 'chart-collection',
  });

  let score = 0;
  let queryCollaborator = false;
  let newCollaboratorId: number | null = null;
  let queryCollection = true;
  let newCollectionSearch: string;
  let newCollectionId: string | null = null;
  let voteOpen = false;
  let collabOpen = false;
  let collectionOpen = false;

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
  $: representation = createQuery(
    api.chart.info(
      { id: $submission.data?.data.representationId ?? '' },
      { enabled: $submission.isSuccess && !!$submission.data?.data.representationId },
    ),
  );
  $: collaborator = createQuery(
    api.user.info(
      { id: newCollaboratorId ?? 0 },
      { enabled: !!newCollaboratorId && queryCollaborator },
    ),
  );
  $: collaborations = createQuery(api.chart.submission.listAllCollaborations({ id }));
  $: collectionSearch = createQuery(
    api.collection.listAll(
      { search: newCollectionSearch ?? undefined },
      { enabled: queryCollection },
    ),
  );
  $: collections = createQuery(
    api.admission.listCollection(
      { rangeAdmitteeId: [$submission.data?.data.representationId ?? ''] },
      { enabled: $submission.isSuccess && !!$submission.data.data.representationId },
    ),
  );

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
        <input type="hidden" id="chart_id" name="chartId" value={id} />
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
                  : 'btn-outline border-2 border-gray-700'} w-full"
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
      <h3 class="font-bold text-lg">{$t('studio.submission.add_collaborator')}</h3>
      <label
        for="new-collaborator"
        class="btn border-2 border-gray-700 hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="collab"
        method="POST"
        class="w-full form-control gap-4"
        action="?/collab"
        use:collabEnhance
        on:submit={() => {
          collabOpen = false;
        }}
      >
        <input type="hidden" id="type" name="type" value="charts" />
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
              class={`input transition border-2 border-gray-700 join-item w-3/4 min-w-[180px] ${
                $collaborator.isError ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newCollaboratorId}
              on:input={() => {
                queryCollaborator = false;
              }}
            />
            <button
              type="button"
              class={`btn border-2 border-gray-700 join-item ${
                newCollaboratorId || $collaborator.isLoading
                  ? $collaborator.isError
                    ? 'btn-error'
                    : 'hover:btn-secondary btn-outline'
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
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('common.position')}
            </span>
            <input
              type="text"
              id="position"
              name="position"
              placeholder={$t('common.position')}
              class="input transition border-2 border-gray-700 hover:input-secondary join-item w-3/4"
            />
          </label>
          <div class="modal-action mt-3">
            <button type="submit" class="btn border-2 border-gray-700 btn-outline">
              {$t('common.submit')}
            </button>
          </div>
        {/if}
      </form>
    </div>
  </div>
  <input type="checkbox" id="new-collection" class="modal-toggle" bind:checked={collectionOpen} />
  <div class="modal">
    <div class="modal-box bg-base-100 form-control gap-3 min-w-[40vw]">
      <h3 class="font-bold text-lg">{$t('studio.submission.add_collection')}</h3>
      <label
        for="new-collection"
        class="btn border-2 border-gray-700 hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="collection"
        method="POST"
        class="w-full form-control gap-4"
        action="?/collection"
        use:collectionEnhance
        on:submit={() => {
          collectionOpen = false;
        }}
      >
        <input type="hidden" id="id" name="id" value={submission.representationId} />
        <div
          class={$collectionSearch.isError
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full'
            : 'w-full'}
          data-tip={$collectionSearch.isError ? $t(`error.${$collectionSearch.error.code}`) : ''}
        >
          <label class="join w-full">
            <input
              type="text"
              placeholder={$t('collection.search')}
              class={`input transition border-2 border-gray-700 w-5/6 join-item min-w-[180px] ${
                $collectionSearch.isError ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newCollectionSearch}
              on:input={() => {
                queryCollection = false;
              }}
            />
            <button
              type="button"
              class={`btn border-2 border-gray-700 w-1/6 join-item ${
                $collectionSearch.isLoading
                  ? $collectionSearch.isError
                    ? 'btn-error'
                    : 'hover:btn-secondary btn-outline'
                  : 'btn-disabled'
              }`}
              on:click={() => {
                queryCollection = true;
              }}
            >
              <i class="fa-solid fa-magnifying-glass fa-lg"></i>
            </button>
          </label>
        </div>
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-fit">
            {$t('common.collections')}
          </span>
          <select
            id="admitter_id"
            name="admitterId"
            class="select transition border-2 border-gray-700 hover:select-secondary w-3/4 join-item"
            bind:value={newCollectionId}
          >
            {#if $collectionSearch.isSuccess}
              {#each $collectionSearch.data.data as collection}
                {#if collection.accessibility in [0, 1] || (user && collection.ownerId === user.id)}
                  <option value={collection.id}>
                    {collection.title} - {collection.subtitle}
                  </option>
                {/if}
              {/each}
            {/if}
          </select>
        </label>
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-fit">
            {$t('collection.label')}
          </span>
          <input
            type="text"
            id="label"
            name="label"
            placeholder={$t('collection.label')}
            class="input transition border-2 border-gray-700 hover:input-secondary join-item w-3/4"
          />
        </label>
        <div class="modal-action mt-3">
          <button
            type="submit"
            class="btn border-2 border-gray-700 hover:btn-secondary btn-outline"
          >
            {$t('common.submit')}
          </button>
        </div>
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
          {$t('studio.chart_submission')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="text-5xl py-3 font-bold gap-4 items-center content flex">
              {#if submission.title}
                {submission.title}
              {:else if $song.isSuccess}
                <a class="hover:underline" href={`/songs/${$song.data.data.id}`}>
                  {$song.data.data.title}
                </a>
              {:else if $songSubmission.isSuccess}
                <a
                  class="hover:underline"
                  href={`/studio/song-submissions/${$songSubmission.data.data.id}`}
                >
                  {$songSubmission.data.data.title}
                </a>
              {/if}
              <div class="join join-vertical lg:join-horizontal min-w-fit">
                <button
                  class="btn {getLevelColor(submission.levelType)} join-item text-3xl no-animation"
                >
                  {submission.level}
                  {submission.difficulty != 0 ? Math.floor(submission.difficulty) : '?'}
                </button>
                {#if submission.isRanked}
                  <button class="btn btn-success join-item text-3xl no-animation">
                    {$t('chart.ranked')}
                  </button>
                {/if}
              </div>
            </div>
            <div>
              <p>
                <span class="badge mr-1">
                  {$t('common.form.chart_level')}
                </span>
                [{LEVEL_TYPES[submission.levelType]}] {submission.level}
              </p>
              <p>
                <span class="badge mr-1">
                  {$t('common.form.chart_difficulty_2')}
                </span>
                {submission.difficulty.toFixed(1)}
              </p>
              <p>
                <span class="badge mr-1">
                  {$t('common.form.chart')}
                </span>
                <a
                  href={submission.file}
                  target="_blank"
                  class="hover:underline min-w-fit"
                  download={submission.file?.split('/').pop()}
                >
                  {$t('common.download')}
                </a>
              </p>
              <p>
                <span class="badge mr-1">{$t('chart.charter')}</span>
                {#if submission.authorName}
                  {@html $charter}
                {:else}
                  {$t('common.anonymous')}
                {/if}
              </p>
              <p>
                <span class="badge mr-1">{$t('chart.notes')}</span>
                {submission.noteCount}
              </p>
              <p>
                <span class="badge mr-1">{$t('chart.format')}</span>
                {$t(`chart.formats.${submission.format}`)}
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
                  {$t('studio.submission.adm_status')}
                </span>
                {$t(`studio.submission.statuses.${submission.admissionStatus}`)}
              </p>
              <p>
                <span class="badge mr-1">
                  {$t('studio.submission.volunteer_status')}
                </span>
                {$t(`studio.submission.statuses.${submission.volunteerStatus}`)}
              </p>
              <p>
                <span class="badge mr-1">
                  {$t('studio.submission.overall_status')}
                </span>
                {$t(`studio.submission.statuses.${submission.status}`)}
              </p>
            </div>
            <div class="card-actions flex items-center justify-end gap-2">
              {#if user && (($uploader.isSuccess && submission.ownerId === user.id) || getUserPrivilege(user.role) >= 4)}
                <a
                  href="/studio/chart-submissions/{submission.id}/edit"
                  class="btn border-2 border-gray-700 btn-outline text-lg w-32"
                >
                  {$t('common.edit')}
                </a>
              {/if}
              {#if user && getUserPrivilege(user.role) >= 4}
                <label
                  for="studio-chart-submission"
                  class="btn border-2 border-gray-700 btn-outline text-lg w-32"
                >
                  {$t('common.vote_v')}
                </label>
              {/if}
              {#if $song.isSuccess || $songSubmission.isSuccess}
                {@const song = $song.data?.data ?? $songSubmission.data?.data}
                <a
                  href="{PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&mode=preview&flag=noRequestingFullscreen&chart={encodeURI(
                    submission.file,
                  )}&song={encodeURI(song?.file ?? '')}&illustration={encodeURI(
                    song?.illustration ?? '',
                  )}&name={submission.title ??
                    song?.title}&level={submission.level}&difficulty={submission.difficulty != 0
                    ? Math.floor(submission.difficulty)
                    : '?'}&composer={song?.authorName}&illustrator={song?.illustrator}&charter={submission.authorName}"
                  class="btn border-2 border-gray-700 btn-outline text-lg w-32"
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
                class="btn border-2 btn-primary btn-outline btn-sm btn-circle absolute right-2 top-2"
              >
                <i class="fa-solid fa-plus fa-lg"></i>
              </label>
            {/if}
            {#if $collaborations.isLoading}
              <div />
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
      {#if !!submission.representationId}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.submission.collections')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10">
              {#if user && (user.id === submission.ownerId || getUserPrivilege(user.role) === 6)}
                <label
                  for="new-collection"
                  class="btn border-2 btn-primary btn-outline btn-sm btn-circle absolute right-2 top-2"
                >
                  <i class="fa-solid fa-plus fa-lg"></i>
                </label>
              {/if}
              {#if $collections.isLoading}
                <div />
              {:else if $collections.isSuccess}
                {#if $collections.data.data.length > 0}
                  {#each $collections.data.data as admission}
                    <CollectionAdmission
                      {admission}
                      editable={user &&
                        ((admission.requesterId === user.id && getUserPrivilege(user.role) >= 3) ||
                          (admission.requesterId !== user.id && getUserPrivilege(user.role) === 6))}
                      showChart={false}
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
      {#if $votes.isSuccess}
        {@const votes = $votes.data.data}
        {#each votes as vote}
          <VolunteerVote {vote} />
        {/each}
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
      {#if $song.isSuccess}
        {@const song = $song.data.data}
        <div class="indicator my-4 w-full">
          <span
            class="indicator-item badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('song.song')}
          </span>
          <Song {song} />
        </div>
      {/if}
      {#if $songSubmission.isSuccess}
        {@const song = $songSubmission.data.data}
        <div class="indicator my-4 w-full">
          <span
            class="indicator-item badge badge-secondary badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.song_submission')}
          </span>
          <SongSubmission {song} />
        </div>
      {/if}
      {#if $representation.isSuccess}
        <Chart chart={$representation.data.data} />
      {/if}
    </div>
  </div>
{/if}
