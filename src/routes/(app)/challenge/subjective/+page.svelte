<script lang="ts">
  import { goto } from '$app/navigation';
  import Question from '$lib/components/question.svelte';
  import { t } from '$lib/translations/config';
  import * as api from '$lib/api';
  import { browser } from '$app/environment';
  import { ContentType, Status } from '$lib/constants';

  export let data: import('./$types').PageData;
  $: ({ status, questions, error, access_token, user } = data);

  /**
   * @type {any[]}
   */
  let getAnswers: any[] = [];

  if (error && browser && getAnswers.length === 0) {
    goto('/challenge');
  }

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

  async function handleSubmit() {
    let texts: any[] = [];
    let chart: any = {};
    getAnswers
      .sort((a, b) => b.id - a.id)
      .forEach((e) => {
        if (e().text) {
          texts.push(e().text);
        } else {
          chart = e().chart;
        }
      });
    let formData = new FormData();
    formData.append('a11', texts[0]);
    formData.append('a12', texts[1]);
    formData.append('a13', texts[2]);
    formData.append('a14', texts[3]);
    formData.append('chart', chart.chart as unknown as File);
    formData.append('song', chart.song as unknown as File);
    formData.append('illustration', chart.illustration as unknown as File);
    formData.append('song_name', chart.songName?.toString());
    formData.append('chart_level', chart.level?.toString());
    formData.append('chart_difficulty', chart.difficulty?.toString());
    const resp = await api.POST('/answers/', formData, access_token, user, ContentType.FORM_DATA);
    if (resp.ok) {
      console.log('OK');
    } else {
      console.log(await resp.json());
    }
  }
</script>

<svelte:head>
  <title>{$t('challenge.title')} - {$t('challenge.subjective')} | {$t('common.title')}</title>
</svelte:head>

<div class="bg-base-200 page">
  {#if status === Status.OK}
    <div
      class="card fixed top-[100px] right-3 px-6 py-3 bg-base-100 shadow-lg z-10 grid grid-flow-col gap-5 text-center auto-cols-max"
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
  {/if}
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-6xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">{$t('challenge.subjective')}</h1>
      {#if status === Status.OK}
        <ul class="px-10">
          {#each questions as question}
            <li class="py-4">
              <Question obj={question} bind:getAnswer={getAnswers[question.q.qid - 1]} />
            </li>
          {/each}
        </ul>
        <button
          class={`btn btn-outline ${
            timeUp ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error' : 'btn-primary'
          } glass float-right my-5 text-lg`}
          data-tip={$t('challenge.time_up')}
          on:click={handleSubmit}>{$t('common.submit')}</button
        >
      {:else}
        <div class="text-center">
          <p class="text-lg text-red-600 my-8">{error}</p>
          <a data-sveltekit-preload-data href="/challenge"
            ><button class="btn btn-primary btn-outline text-lg">{$t('common.back')}</button></a
          >
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
