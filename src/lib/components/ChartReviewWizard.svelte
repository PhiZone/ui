<script lang="ts">
  import { t } from '$lib/translations/config';

  import VoteScore from './VoteScore.svelte';

  interface Props {
    score: number;
    message: string;
    onConfirm: () => void;
  }
  let { score = $bindable(), message = $bindable(), onConfirm }: Props = $props();

  const answers = [3, 2, 0, -3];
  const innovationAnswers = [1, 0];
  const structureAnswers = [1, 0, -1];

  let step = $state(0),
    scores: number[] = $state([]),
    innovationScores: number[] = $state([]),
    structureScores: number[] = $state([]),
    realScores: number[] = $state([]),
    realScore = $state(0),
    questions = [...Array(5).keys()].map((i) =>
      $t('review_wizard.question', {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        aspect: $t(`review_wizard.aspects.${i}`),
      }),
    );

  const calculate = () => {
    for (var i = 0; i < 5; i++) {
      if (scores[i] === 2) {
        realScores[i] =
          scores[i] + (innovationScores[i] ? innovationScores[i] : structureScores[i] || 0);
      } else if (scores[i] === 0) {
        realScores[i] = scores[i] + (structureScores[i] || 0);
      } else {
        realScores[i] = scores[i] || 0;
      }
    }
    realScore =
      realScores[0] * 0.15 +
      realScores[1] * 0.15 +
      realScores[2] * 0.2 +
      realScores[3] * 0.2 +
      realScores[4] * 0.3;
    const disqualifiedCount = realScores.filter((s) => s === -3).length;
    if (disqualifiedCount === 1) {
      realScore = Math.min(realScore, 1);
    } else if (disqualifiedCount === 2) {
      realScore = Math.min(realScore, 0);
    } else if (disqualifiedCount >= 3) {
      realScore = Math.min(realScore, -1);
    }
    score = Math.round(realScore * 20) / 20;
  };
</script>

<input type="checkbox" id="chart-review-wizard" class="modal-toggle" />
<div class="modal">
  <div class="modal-box max-w-3xl">
    <label
      for="chart-review-wizard"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-3">{$t('review_wizard.title')}</h3>
    <ul class="steps w-full my-1">
      {#each Array(5).keys() as i}
        <li class="step font-bold {step >= i ? 'step-primary' : ''}">
          {$t(`review_wizard.aspect_names.${i}`)}
        </li>
      {/each}
    </ul>
    <div class="m-6 flex flex-col gap-3">
      <p class="text-lg font-bold pt-2 pb-1">{questions[step]}</p>
      {#each Array(4).keys() as i}
        <div class="flex gap-2">
          <input
            type="radio"
            name="score"
            class="radio border-2 radio-secondary"
            bind:group={scores[step]}
            onchange={calculate}
            value={answers[i]}
          />
          <p class="text-base">{$t(`review_wizard.answers.${i}`)}</p>
        </div>
      {/each}
    </div>
    {#if scores[step] === 2}
      <div class="m-6 flex flex-col gap-3">
        <p class="text-lg font-bold pt-2 pb-1">{$t('review_wizard.innovation_question')}</p>
        {#each Array(2).keys() as i}
          <div class="flex gap-2">
            <input
              type="radio"
              name="innovation"
              class="radio border-2 radio-secondary"
              bind:group={innovationScores[step]}
              onchange={calculate}
              value={innovationAnswers[i]}
            />
            <p class="text-base">{$t(`review_wizard.innovation_answers.${i}`)}</p>
          </div>
        {/each}
      </div>
    {/if}
    {#if (scores[step] === 2 && innovationScores[step] === 0) || scores[step] === 0}
      <div class="m-6 flex flex-col gap-3">
        <p class="text-lg font-bold pt-2 pb-1">{$t('review_wizard.structure_question')}</p>
        {#each Array(3).keys() as i}
          <div class="flex gap-2">
            <input
              type="radio"
              name="structure"
              class="radio border-2 radio-secondary"
              bind:group={structureScores[step]}
              onchange={calculate}
              value={structureAnswers[i]}
            />
            <p class="text-base">{$t(`review_wizard.structure_answers.${i}`)}</p>
          </div>
        {/each}
      </div>
    {/if}
    <div class="mt-1 flex justify-between items-center">
      <div class="flex gap-1 items-center">
        <span class="badge">{$t('review_wizard.current_score')}</span>
        <VoteScore score={realScore} size={16} centered={false} />
      </div>
      <div class="flex join">
        <button
          class="btn btn-outline border-2 normal-border join-item"
          disabled={step <= 0}
          onclick={() => {
            step--;
          }}
        >
          {$t('common.back')}
        </button>
        {#if step < 4}
          <button
            class="btn btn-outline border-2 normal-border join-item"
            onclick={() => {
              step++;
            }}
            onchange={calculate}
          >
            {$t('common.continue')}
          </button>
        {:else}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
          <label
            for="chart-review-wizard"
            class="btn btn-outline border-2 normal-border join-item"
            onclick={() => {
              calculate();
              if (message) {
                message += `\n${[...Array(5).keys()]
                  .map(
                    (i) =>
                      `${$t(`review_wizard.aspect_names.${i}`)}${$t('common.colon')}${
                        realScores[i]
                      }`,
                  )
                  .join($t('common.semicolon'))}\n`;
              } else {
                message = `${[...Array(5).keys()]
                  .map(
                    (i) =>
                      `${$t(`review_wizard.aspect_names.${i}`)}${$t('common.colon')}${
                        realScores[i]
                      }`,
                  )
                  .join($t('common.semicolon'))}\n`;
              }
              onConfirm();
            }}
          >
            {$t('common.confirm')}
          </label>
        {/if}
      </div>
    </div>
  </div>
</div>
