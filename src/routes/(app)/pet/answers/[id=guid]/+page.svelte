<script lang="ts">
  import 'katex/dist/katex.min.css';
  import { superForm } from 'sveltekit-superforms';

  import Question from '$lib/components/Question.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  export let data;
  $: ({ user, answer } = data);

  const {
    // form: reviewForm,
    enhance,
    errors,
    message,
    submitting,
    allErrors,
  } = superForm(data.form);
  let score = 0;
</script>

<svelte:head>
  <title>{$t('pet.answer.answer')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="info-page">
  <div class="mx-auto lg:mx-4 lg:w-[60vw]">
    <div class="indicator w-full my-4">
      <span
        class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
        style:--tw-translate-x="0"
      >
        {$t('pet.answer.answer')}
      </span>
      <div
        class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
      >
        <div class="card-body py-10">
          <div class="stats stats-vertical sm:stats-horizontal">
            <div class="stat place-items-center">
              <div class="stat-title">{$t('pet.answer.objective_score')}</div>
              <div class="stat-value text-5xl">{answer.objectiveScore}</div>
              <div class="stat-desc">/ 40</div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">{$t('pet.answer.subjective_score')}</div>
              <div class="stat-value text-5xl">{answer.subjectiveScore ?? '-'}</div>
              <div class="stat-desc">/ 60</div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">{$t('pet.answer.total_score')}</div>
              <div class="stat-value text-5xl">{answer.totalScore ?? '-'}</div>
              <div class="stat-desc">/ 100</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Question
      id={16}
      question={answer.question1}
      choices={null}
      text={null}
      answer={answer.answer1}
    />
    <Question
      id={17}
      question={answer.question2}
      choices={null}
      text={null}
      answer={answer.answer2}
    />
    <Question
      id={18}
      question={answer.question3}
      choices={null}
      text={null}
      answer={answer.answer3}
    />
    <Question
      id={19}
      question={answer.question4}
      choices={null}
      text={null}
      answer={answer.chart}
    />
  </div>
  <div class="w-80 form-control mx-auto lg:mx-4">
    <div class="indicator w-full my-4">
      <span
        class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
        style:--tw-translate-x="0"
      >
        {$t('pet.answer.answerer')}
      </span>
      <User id={answer.ownerId} />
    </div>
    {#if answer.assessorId}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('pet.answer.assessor')}
        </span>
        <User id={answer.assessorId} />
      </div>
    {:else if getUserPrivilege(user?.role) >= 5}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('pet.answer.assess')}
        </span>
        <div class="card bg-base-100 w-full transition border-2 normal-border hover:shadow-lg">
          <form id="review" class="card-body" method="POST" action="?/assess" use:enhance>
            <input type="hidden" id="id" name="id" value={answer.id} />
            <h2 class="card-title">{$t('pet.answer.subjective_score')}</h2>
            <div class="flex">
              <div class="flex gap-2 items-center w-full">
                <input type="range" min="0" max="60" bind:value={score} class="range w-3/4" />
                <input
                  type="text"
                  id="score"
                  name="score"
                  bind:value={score}
                  class="input w-1/4 text-right text-xl font-bold"
                  on:input={(e) => {
                    if (!/^\d+$/.test(e.currentTarget.value)) {
                      e.currentTarget.value = `${score}`;
                      return;
                    }
                    if (parseInt(e.currentTarget.value) < 0) {
                      e.currentTarget.value = '0';
                    } else if (parseInt(e.currentTarget.value) > 60) {
                      e.currentTarget.value = '60';
                    }
                  }}
                />
              </div>
              <div
                class="tooltip tooltip-right tooltip-error"
                class:tooltip-open={!!$errors.score}
                data-tip={$errors.score}
              ></div>
            </div>
            <div class="card-actions justify-end">
              <button
                type="submit"
                class="btn {$allErrors.length > 0
                  ? 'btn-error'
                  : $submitting
                    ? 'btn-ghost'
                    : 'btn-outline border-2 normal-border'} w-full"
                disabled={$submitting}
              >
                {$allErrors.length > 0
                  ? $t('common.error')
                  : $submitting
                    ? $t('common.waiting')
                    : $t('common.submit')}
              </button>
              <div
                class="tooltip tooltip-bottom tooltip-error w-full"
                class:tooltip-open={!!$message}
                data-tip={$message}
              ></div>
            </div>
          </form>
        </div>
      </div>
    {/if}
  </div>
</div>
