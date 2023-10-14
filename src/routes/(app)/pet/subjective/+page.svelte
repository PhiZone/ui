<script lang="ts">
  import type { PetQuestionDto } from '$lib/api/pet.js';
  import Question from '$lib/components/Question.svelte';
  import { t } from '$lib/translations/config';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;
  $: ({ questions, error } = data);

  let min = 59,
    sec = 59;

  let timeUp = false;

  let timer = setInterval(() => {
    if (sec == 0) {
      if (min == 0) {
        clearInterval(timer);
        timeUp = true;
      } else {
        min--;
        sec = 59;
      }
    } else {
      sec--;
    }
  }, 1000);

  let answers: string[] = [];
  let chartQuestion: PetQuestionDto = {
    position: 19,
    type: 2,
    content: $t('pet.chart_question'),
    choices: null,
    language: 'zh-CN',
  };

  const { enhance, message, errors: _errors, submitting, allErrors } = superForm(data.form);
</script>

<svelte:head>
  <title>{$t('pet.title')} - {$t('pet.subjective')} | {$t('common.title')}</title>
</svelte:head>

<div class="bg-base-200 page">
  <div
    class="card fixed top-20 right-3 px-6 py-3 bg-base-100 shadow-lg z-10 grid grid-flow-col gap-5 text-center auto-cols-max"
  >
    <div class="flex form-control">
      <span class={`countdown font-mono text-5xl ${min == 0 ? 'text-red-600' : ''}`}>
        <span style={`--value:${min};`} />
      </span>
      min
    </div>
    <div class="flex form-control">
      <span class={`countdown font-mono text-5xl ${min == 0 ? 'text-red-600' : ''}`}>
        <span style={`--value:${sec};`} />
      </span>
      sec
    </div>
  </div>
  <div class="mx-auto max-w-6xl min-w-[50vw]">
    <h1 class="text-4xl font-bold mb-6">{$t('pet.subjective')}</h1>
    {#if questions}
      <ul class="flex flex-col gap-4">
        {#each questions as question, i}
          <li>
            <Question id={i + 16} {question} choices={null} bind:text={answers[i]} />
            <!-- <div
              class="tooltip tooltip-bottom tooltip-error"
              class:tooltip-open={$errors._errors && !!$errors._errors[i]}
              data-tip={$errors._errors ? $errors._errors[i] : ''}
            /> -->
          </li>
        {/each}
        <li>
          <Question
            id={19}
            question={chartQuestion}
            choices={null}
            bind:text={answers[3]}
            textAreaCss="text-base h-24"
          />
          <!-- <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={$errors._errors && !!$errors._errors[3]}
            data-tip={$errors._errors ? $errors._errors[3] : ''}
          /> -->
        </li>
      </ul>
      <form method="POST" class="flex justify-end" use:enhance>
        <input type="hidden" name="answer1" bind:value={answers[0]} />
        <input type="hidden" name="answer2" bind:value={answers[1]} />
        <input type="hidden" name="answer3" bind:value={answers[2]} />
        <input type="hidden" name="chart" bind:value={answers[3]} />
        <button
          class={`btn btn-outline ${
            $message
              ? 'btn-error tooltip tooltip-open tooltip-left tooltip-error'
              : timeUp
              ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error'
              : 'btn-primary'
          } my-5`}
          data-tip={timeUp ? $t('pet.time_up') : $message}
          disabled={$submitting}
        >
          {$allErrors.length > 0
            ? $t('common.error')
            : $submitting
            ? $t('common.waiting')
            : $t('common.submit')}
        </button>
      </form>
    {:else}
      <div class="text-center">
        <p class="text-lg text-red-600 my-8">
          {$t(error ? `error.${error}` : 'common.unknown_error')}
        </p>
        <a href="/pet">
          <button class="btn btn-primary btn-outline">{$t('common.back')}</button>
        </a>
      </div>
    {/if}
  </div>
</div>
