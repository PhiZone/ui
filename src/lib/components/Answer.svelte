<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import type { PetAnswerDto } from '$lib/api/pet';

  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';

  export let answer: PetAnswerDto;

  $: ({ user, api } = $page.data);

  $: owner = createQuery(api.user.info({ id: answer.ownerId }));
</script>

<a
  class="card card-side w-full bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
  href={`/pet/answers/${answer.id}`}
>
  <figure class="w-1/6 min-w-fit">
    <div
      class="relative inline-flex items-center justify-center form-control border-r normal-border px-3 py-3 mx-auto my-auto"
    >
      <p class="opacity-80">
        {$t(answer.totalScore !== null ? 'pet.answer.total_score' : 'pet.answer.objective_score')}
      </p>
      <p class="text-4xl font-extrabold">
        {answer.totalScore ?? answer.objectiveScore}
      </p>
    </div>
  </figure>
  <div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
    <p class="w-full text-lg truncate">
      <span class="badge mr-1">A 16</span>
      {answer.answer1}
    </p>
    <p class="w-full text-lg truncate">
      <span class="badge mr-1">A 17</span>
      {answer.answer2}
    </p>
    <p class="w-full text-lg truncate">
      <span class="badge mr-1">A 18</span>
      {answer.answer3}
    </p>
    <p class="w-full text-lg truncate">
      <span class="badge mr-1">A 19</span>
      {answer.chart}
    </p>
    <div class="w-full flex justify-between items-center">
      <p class="text-sm opacity-70 flex justify-end items-center gap-2">
        <a href={`/users/${answer.ownerId}`} target="_blank" class="hover:underline">
          {$owner.data?.data.userName ?? ''}
        </a>
        <span>·</span>
        <span>
          {parseDateTime(answer.dateCreated, true, user?.language)}
        </span>
      </p>
    </div>
  </div>
</a>
