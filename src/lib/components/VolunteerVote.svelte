<script lang="ts">
  import { page } from '$app/stores';
  import type { VolunteerVoteDto } from '$lib/api/vote.volunteer';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';

  export let vote: VolunteerVoteDto;

  $: ({ api } = $page.data);

  $: owner = createQuery(api.user.info({ id: vote.ownerId }));
</script>

<div class="indicator w-full my-4">
  <span
    class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
    style:--tw-translate-x="0"
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
          {vote.score}
        </p>
      </div>
    </figure>
    <div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
      <p class="w-full content text-lg">
        {vote.message}
      </p>
      <div class="w-full mt-4 flex justify-between items-center">
        <p class="text-sm opacity-70 text-right">
          <a
            href={`/users/${vote.ownerId}`}
            target="_blank"
            rel="noreferrer"
            class="hover:underline"
          >
            {$owner.data?.data.userName ?? ''}
          </a>
          @
          {parseDateTime(vote.dateCreated)}
        </p>
      </div>
    </div>
  </div>
</div>
