<script lang="ts">
  import { t } from '$lib/translations/config';
  import { richtext } from '$lib/richtext';
  import { getLevelColor, getLevelDisplay, getUserPrivilege, parseDateTime } from '$lib/utils';
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
  import ChartAssetSubmission from '$lib/components/ChartAsset.svelte';
  import CollectionAdmission from '$lib/components/CollectionAdmission.svelte';
  import Error from '$lib/components/Error.svelte';
  import ChartReviewWizard from '$lib/components/ChartReviewWizard.svelte';
  import VoteScore from '$lib/components/VoteScore.svelte';
  import DifficultySuggestion from '$lib/components/DifficultySuggestion.svelte';
  import Tag from '$lib/components/Tag.svelte';

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
    onResult({ result }) {
      if (result.type == 'success') {
        voteOpen = false;
      }
    },
  });

  const {
    enhance: collabEnhance,
    errors: collabErrors,
    message: collabMessage,
    submitting: collabSubmitting,
    allErrors: collabAllErrors,
  } = superForm(data.collabForm, {
    id: 'chart-collab',
    onResult({ result }) {
      if (result.type == 'success') {
        collabOpen = false;
      }
    },
  });

  const {
    enhance: collectionEnhance,
    errors: collectionErrors,
    message: collectionMessage,
    submitting: collectionSubmitting,
    allErrors: collectionAllErrors,
  } = superForm(data.collectionForm, {
    id: 'chart-collection',
    onResult({ result }) {
      if (result.type == 'success') {
        collectionOpen = false;
      }
    },
  });

  let score = 0;
  let suggestedDifficulty = 0;
  let message = '';
  let queryCollaborator = false;
  let newCollaboratorId: number | null = null;
  let queryCollection = true;
  let newCollectionSearch: string;
  let newCollectionId: string | null = null;
  let voteOpen = false;
  let collabOpen = false;
  let collectionOpen = false;

  $: submission = createQuery(api.chart.submission.info({ id }));
  $: uploader = createQuery(
    api.user.info({ id: $submission.data?.data.ownerId ?? 0 }, { enabled: $submission.isSuccess }),
  );
  $: votes = createQuery(
    api.vote.volunteer.listAll({ chartId: id, order: ['dateCreated'], desc: [true] }),
  );
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
  $: assets = createQuery(api.chart.submission.asset.listAll({ chartId: id }));
  $: charter = richtext($submission.data?.data.authorName ?? '');

  $: averageSuggestedDifficulty =
    $votes.isSuccess && $submission.isSuccess
      ? $votes.data.data
          .filter((vote) => vote.dateCreated > $submission.data!.data.dateUpdated)
          .reduce((total, vote) => total + vote.suggestedDifficulty, 0) /
        $votes.data.data.filter((vote) => vote.dateCreated > $submission.data!.data.dateUpdated)
          .length
      : 0;

  $: difficultyDifference = $submission.isSuccess
    ? averageSuggestedDifficulty - $submission.data.data.difficulty
    : 0;
</script>

<svelte:head>
  <title>
    {$t('studio.chart_submission')} - {$submission.data?.data.title ??
      $submission.data?.data.song?.title ??
      $submission.data?.data.songSubmission?.title}
    [{$submission.data?.data.level}
    {getLevelDisplay($submission.data?.data.difficulty)}] | {$t('common.title')}
  </title>
</svelte:head>

{#if $submission.isSuccess}
  {@const submission = $submission.data.data}
  <ChartReviewWizard
    bind:score
    bind:message
    onConfirm={() => {
      voteOpen = true;
    }}
  />
  <input
    type="checkbox"
    id="studio-chart-submission"
    class="modal-toggle"
    bind:checked={voteOpen}
  />
  <div class="modal">
    <div class="modal-box max-w-2xl bg-base-100">
      <label
        for="studio-chart-submission"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h2 class="font-bold text-xl mb-4">{$t('common.vote_v')}</h2>
      <form id="vote" method="POST" class="form-control" action="?/vote" use:voteEnhance>
        <input type="hidden" id="chart_id" name="chartId" value={id} />
        <div class="flex items-center gap-2">
          <input
            id="score"
            name="score"
            type="range"
            min="-3"
            max="3"
            bind:value={score}
            class="range"
            step="0.05"
          />
          <VoteScore {score} size={16} centered={false} />
        </div>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$voteErrors.score}
          data-tip={$voteErrors.score}
        />
        <div class="flex items-center gap-2">
          <input
            id="suggested_difficulty"
            name="suggestedDifficulty"
            type="range"
            min="0"
            max="18"
            bind:value={suggestedDifficulty}
            class="range"
            step="0.1"
          />
          <DifficultySuggestion
            bind:suggested={suggestedDifficulty}
            actual={submission.difficulty}
            size={16}
            centered={false}
            compact
          />
        </div>
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$voteErrors.score}
          data-tip={$voteErrors.score}
        />
        <div
          class={$voteErrors.message
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-4'
            : 'my-4'}
          data-tip={$voteErrors.message}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px] max-w-[180px]">
              {$t('studio.submission.message')}
            </span>
            <textarea
              id="message"
              name="message"
              class="textarea transition border-2 normal-border hover:textarea-secondary join-item w-full h-48"
              placeholder={$t('studio.submission.write_message')}
              bind:value={message}
            />
          </label>
        </div>
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
                  : 'btn-outline border-2 normal-border'} w-full"
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
              class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                $collaborator.isError ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newCollaboratorId}
              on:input={() => {
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
  <input type="checkbox" id="new-collection" class="modal-toggle" bind:checked={collectionOpen} />
  <div class="modal">
    <div class="modal-box bg-base-100 form-control gap-3 min-w-[40vw]">
      <h3 class="font-bold text-lg">{$t('studio.submission.add_collection')}</h3>
      <label
        for="new-collection"
        class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <form
        id="collection"
        method="POST"
        class="w-full form-control gap-4"
        action="?/collection"
        use:collectionEnhance
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
              class={`input transition border-2 normal-border w-5/6 join-item min-w-[180px] ${
                $collectionSearch.isError ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={newCollectionSearch}
              on:input={() => {
                queryCollection = false;
              }}
            />
            <button
              type="button"
              class={`btn border-2 normal-border w-1/6 join-item ${
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
            class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
            bind:value={newCollectionId}
          >
            {#if $collectionSearch.isSuccess}
              {#each $collectionSearch.data.data as collection}
                {#if [0, 1].includes(collection.accessibility) || (user && collection.ownerId === user.id)}
                  <option value={collection.id}>
                    {collection.title} - {collection.subtitle}
                  </option>
                {/if}
              {/each}
            {/if}
          </select>
        </label>
        <div
          class={$collectionErrors.label ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$collectionErrors.label}
        >
          <label class="join w-full">
            <span class="btn no-animation join-item w-1/4 min-w-fit">
              {$t('collection.label')}
            </span>
            <input
              type="text"
              id="label"
              name="label"
              placeholder={$t('collection.label')}
              class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
            />
          </label>
        </div>
        <div class="modal-action mt-3">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={!!$collectionMessage}
            data-tip={$collectionMessage}
          >
            <button
              type="submit"
              class="btn {$collectionAllErrors.length > 0
                ? 'btn-error'
                : $collectionSubmitting
                  ? 'btn-ghost'
                  : 'btn-outline border-2 normal-border'} w-full"
              disabled={$collectionSubmitting}
            >
              {$collectionAllErrors.length > 0
                ? $t('common.error')
                : $collectionSubmitting
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
          {$t('studio.chart_submission')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="text-5xl py-3 font-bold gap-4 items-center content flex">
              {#if submission.title}
                {submission.title}
              {:else if submission.song}
                <a class="hover:underline" href={`/songs/${submission.song.id}`}>
                  {submission.song.title}
                </a>
              {:else if submission.songSubmission}
                <a
                  class="hover:underline"
                  href={`/studio/song-submissions/${submission.songSubmission.id}`}
                >
                  {submission.songSubmission.title}
                </a>
              {/if}
              <div class="join join-vertical lg:join-horizontal min-w-fit">
                <button
                  class="btn {getLevelColor(submission.levelType)} join-item text-3xl no-animation"
                >
                  {submission.level}
                  {getLevelDisplay(submission.difficulty)}
                </button>
                {#if submission.isRanked}
                  <button
                    class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg join-item text-3xl no-animation"
                  >
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
              {#if !isNaN(averageSuggestedDifficulty)}
                <p>
                  <span class="badge mr-1">
                    {$t('studio.submission.suggested_difficulty')}
                  </span>
                  {averageSuggestedDifficulty.toFixed(2)}
                  <span
                    class="opacity-80 self-center {Math.abs(difficultyDifference) < 0.4
                      ? 'text-success'
                      : 'text-error'}"
                  >
                    ({difficultyDifference >= 0
                      ? `+${difficultyDifference.toFixed(2)}`
                      : difficultyDifference.toFixed(2)})
                  </span>
                </p>
              {/if}
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
              {#if submission.tags.length > 0}
                <p class="inline-flex gap-1 flex-wrap">
                  <span class="badge">
                    {$t('common.tags')}
                  </span>
                  {#each submission.tags as tag}
                    <Tag {tag} />
                  {/each}
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
                  class="btn border-2 normal-border btn-outline text-lg w-32"
                >
                  {$t('common.edit')}
                </a>
              {/if}
              {#if getUserPrivilege(user?.role) >= 4}
                <label
                  for="chart-review-wizard"
                  class="btn border-2 normal-border btn-outline text-lg w-32"
                >
                  {$t('common.vote_v')}
                </label>
              {/if}
              {#if submission.song || submission.songSubmission}
                {@const song = submission.song ?? submission.songSubmission}
                <a
                  href="{PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&mode=preview&flag=noRequestingFullscreen&chart={encodeURI(
                    submission.file,
                  )}&song={encodeURI(song?.file ?? '')}&illustration={encodeURI(
                    song?.illustration ?? '',
                  )}&name={submission.title ??
                    song?.title}&level={submission.level}&difficulty={getLevelDisplay(
                    submission.difficulty,
                  )}&composer={song?.authorName}&illustrator={song?.illustrator}&charter={submission.authorName}&assets={$assets.data?.data
                    .map((asset) => encodeURI(asset.file))
                    .join(',')}"
                  class="btn border-2 normal-border btn-outline text-lg w-32"
                  target="_target"
                >
                  {$t('common.preview')}
                </a>
                <a
                  href="{PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&flag=noRequestingFullscreen&chart={encodeURI(
                    submission.file,
                  )}&song={encodeURI(song?.file ?? '')}&illustration={encodeURI(
                    song?.illustration ?? '',
                  )}&name={submission.title ??
                    song?.title}&level={submission.level}&difficulty={getLevelDisplay(
                    submission.difficulty,
                  )}&composer={song?.authorName}&illustrator={song?.illustrator}&charter={submission.authorName}&assets={$assets.data?.data
                    .map((asset) => encodeURI(asset.file))
                    .join(',')}"
                  class="btn border-2 normal-border btn-outline text-lg w-32"
                  target="_target"
                >
                  {$t('studio.submission.playtest')}
                </a>
              {/if}
            </div>
          </div>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.assets')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body pt-14 pb-10">
            <a
              class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
              href="/studio/chart-submissions/{id}/assets"
            >
              {$t('common.more')}
              <i class="fa-solid fa-angles-right"></i>
            </a>
            {#if $assets.isLoading}
              <div />
            {:else if $assets.isSuccess}
              {#if $assets.data.data.length > 0}
                <div class="result">
                  {#each $assets.data.data.slice(0, 12) as chartAsset}
                    <ChartAssetSubmission {chartAsset} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
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
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.submission.collections')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10">
              {#if user && (user.id === submission.ownerId || getUserPrivilege(user.role) === 6)}
                <label
                  for="new-collection"
                  class="btn border-2 normal-border btn-outline btn-sm btn-circle absolute right-2 top-2"
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
          <VolunteerVote {vote} {submission} />
        {/each}
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
      {#if submission.song}
        {@const song = submission.song}
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
      {#if submission.songSubmission}
        {@const song = submission.songSubmission}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('studio.song_submission')}
          </span>
          <SongSubmission {song} />
        </div>
      {/if}
      {#if $representation.isSuccess}
        {@const chart = $representation.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.chart')}
          </span>
          <Chart {chart} />
        </div>
      {/if}
    </div>
  </div>
{:else if $submission.isError}
  <Error error={$submission.error} back="/studio/chart-submissions" />
{:else}
  <div class="min-h-screen skeleton" />
{/if}
