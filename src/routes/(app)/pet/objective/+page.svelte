<script lang="ts">
  import 'katex/dist/katex.min.css';

  import { goto } from '$app/navigation';
  import Question from '$lib/components/Question.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { questions } = $derived(data);

  const timeLimit = 30;
  const timeDue = new Date();
  timeDue.setMinutes(timeDue.getMinutes() + timeLimit);

  let min = $state(timeLimit - 1);
  let sec = $state(59);

  let timeUp = $state(false);

  let timer = setInterval(() => {
    if (sec === 0 && min === 0) {
      clearInterval(timer);
      timeUp = true;
      return;
    }
    const diff = timeDue.getTime() - new Date().getTime();
    min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    sec = Math.floor((diff % (1000 * 60)) / 1000);
  }, 100);

  let answers: number[][] = $derived(Array(questions.length).fill([]));
</script>

<svelte:head>
  <title>{$t('pet.title')} - {$t('pet.objective')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="page">
  <div
    class="card fixed top-20 right-3 px-6 py-3 bg-base-100 transition border-2 normal-border hover:shadow-lg z-10 grid grid-flow-col gap-5 text-center auto-cols-max"
  >
    <div class="form-control">
      <span class={`countdown font-code text-5xl ${min === 0 ? 'text-error' : ''}`}>
        <span style={`--value:${min};`}></span>
      </span>
      min
    </div>
    <div class="form-control">
      <span class={`countdown font-code text-5xl ${min === 0 ? 'text-error' : ''}`}>
        <span style={`--value:${sec};`}></span>
      </span>
      sec
    </div>
  </div>
  <div class="mx-auto max-w-6xl min-w-[50vw]">
    <h1 class="text-4xl font-bold mb-6">{$t('pet.objective')}</h1>
    {#if questions}
      <ul class="flex flex-col gap-4">
        {#each questions as question, i}
          <li>
            <Question id={i + 1} {question} bind:choices={answers[i]} />
          </li>
        {/each}
      </ul>
      <div class="flex justify-end">
        <button
          class={`btn border-2 ${
            timeUp
              ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error'
              : 'normal-border hover:btn-outline'
          } my-5`}
          data-tip={$t('pet.time_up')}
          onclick={() => {
            goto(`subjective?answers=${JSON.stringify(answers)}`);
          }}
        >
          {$t('common.continue')}
        </button>
      </div>
    {:else}
      <div class="text-center">
        <p class="text-lg text-error my-8">
          {$t('common.unknown_error')}
        </p>
        <a href="/pet">
          <button class="btn border-2 hover:btn-outline">{$t('common.back')}</button>
        </a>
      </div>
    {/if}
  </div>
</div>
