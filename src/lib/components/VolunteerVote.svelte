<script lang="ts">
  import { page } from '$app/stores';
  import type { VolunteerVoteDto } from '$lib/api/vote.volunteer';
  import type { ChartSubmissionDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import VoteScore from './VoteScore.svelte';
  import DifficultySuggestion from './DifficultySuggestion.svelte';

  export let vote: VolunteerVoteDto;
  export let submission: ChartSubmissionDto;

  $: ({ api } = $page.data);

  $: owner = createQuery(api.user.info({ id: vote.ownerId }));
</script>

<div class="indicator w-full my-4">
  <span
    class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
    style:--tw-translate-x="0"
  >
    {$t('studio.submission.volunteer_vote')}
  </span>
  <div class="card card-side w-full bg-base-100 border-2 normal-border transition hover:shadow-lg">
    <figure class="w-1/6 min-w-fit">
      <div
        class="relative inline-flex items-center justify-center form-control border-r normal-border px-3 py-3 mx-auto my-auto"
      >
        <p class="opacity-80">{$t('studio.submission.score')}</p>
        <VoteScore score={vote.score} obsolete={vote.dateCreated < submission.dateFileUpdated} />
      </div>
    </figure>
    <figure class="w-1/6 min-w-fit">
      <div
        class="relative inline-flex items-center justify-center form-control border-r normal-border px-3 py-3 mx-auto my-auto"
      >
        <p class="opacity-80">{$t('studio.submission.suggested_difficulty')}</p>
        <DifficultySuggestion
          suggested={vote.suggestedDifficulty}
          actual={submission.difficulty}
          obsolete={vote.dateCreated < submission.dateFileUpdated}
        />
      </div>
    </figure>
    <div class="card-body w-2/3 pt-6 pl-6 pb-4 pr-4">
      <p class="w-full content text-lg">
        {vote.message}
      </p>
      <div class="w-full mt-4 flex justify-between items-center">
        <p class="text-sm opacity-70 text-right">
          <a href={`/users/${vote.ownerId}`} target="_blank" class="hover:underline">
            {$owner.data?.data.userName ?? ''}
          </a>
          @
          {parseDateTime(vote.dateCreated)}
        </p>
      </div>
    </div>
  </div>
</div>
