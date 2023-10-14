<script lang="ts">
  import { t } from '$lib/translations/config';
  import User from '$lib/components/User.svelte';
  import Question from '$lib/components/Question.svelte';
  import type { PetQuestionDto } from '$lib/api/pet';

  export let data;
  $: ({ answer } = data);

  let chartQuestion: PetQuestionDto = {
    position: 19,
    type: 2,
    content: $t('pet.chart_question'),
    choices: null,
    language: 'zh-CN',
  };
</script>

<svelte:head>
  <title>{$t('pet.answer.answer')} | {$t('common.title')}</title>
</svelte:head>

<div class="info-page">
  <div class="mx-auto lg:mx-4 lg:w-[60vw]">
    <div class="indicator w-full my-4">
      <span
        class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
        style:--tw-translate-x="0"
      >
        {$t('pet.answer.answer')}
      </span>
      <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
        <div class="card-body py-10">
          <div class="stats">
            <div class="stat place-items-center">
              <div class="stat-title">{$t('pet.answer.objective_score')}</div>
              <div class="stat-value">{answer.objectiveScore}</div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">{$t('pet.answer.subjective_score')}</div>
              <div class="stat-value">{answer.subjectiveScore ?? '-'}</div>
            </div>
            <div class="stat place-items-center">
              <div class="stat-title">{$t('pet.answer.total_score')}</div>
              <div class="stat-value">{answer.totalScore ?? '-'}</div>
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
    <Question id={19} question={chartQuestion} choices={null} text={null} answer={answer.chart} />
  </div>
  <div class="w-80 form-control mx-auto lg:mx-4">
    <div class="indicator my-4 w-full">
      <span
        class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
        style:--tw-translate-x="0"
      >
        {$t('pet.answer.answerer')}
      </span>
      <User id={answer.ownerId} />
    </div>
    {#if answer.assessorId}
      <div class="indicator my-4 w-full">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('pet.answer.assessor')}
        </span>
        <User id={answer.assessorId} />
      </div>
    {/if}
  </div>
</div>
