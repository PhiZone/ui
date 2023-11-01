<script lang="ts">
  import { goto } from '$app/navigation';
  import Question from '$lib/components/Question.svelte';
  import { t } from '$lib/translations/config';

  export let data;
  $: ({ questions } = data);

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

  let answers: number[][] = [];
</script>

<svelte:head>
  <title>{$t('pet.title')} - {$t('pet.objective')} | {$t('common.title')}</title>
</svelte:head>

<div class="bg-base-200 page">
  <div
    class="card fixed top-20 right-3 px-6 py-3 bg-base-100 shadow-lg z-10 grid grid-flow-col gap-5 text-center auto-cols-max"
  >
    <div class="flex form-control">
      <span class={`countdown font-mono text-5xl ${min == 0 ? 'text-error' : ''}`}>
        <span style={`--value:${min};`} />
      </span>
      min
    </div>
    <div class="flex form-control">
      <span class={`countdown font-mono text-5xl ${min == 0 ? 'text-error' : ''}`}>
        <span style={`--value:${sec};`} />
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
            <Question id={i + 1} {question} bind:choices={answers[i]} text={null} />
          </li>
        {/each}
      </ul>
      <div class="flex justify-end">
        <button
          class={`btn btn-outline ${
            timeUp ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error' : 'btn-primary'
          } my-5`}
          data-tip={$t('pet.time_up')}
          on:click={() => {
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
          <button class="btn btn-primary btn-outline">{$t('common.back')}</button>
        </a>
      </div>
    {/if}
  </div>
</div>
