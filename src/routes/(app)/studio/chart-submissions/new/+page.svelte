<script lang="ts">
  import { t } from '$lib/translations/config';
  import { LEVEL_TYPES } from '$lib/constants';
  import User from '$lib/components/User.svelte';
  import { getLevelColor } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms/client';
  import { createQuery } from '@tanstack/svelte-query';
  import { richtext } from '$lib/richtext';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import type { SongDto } from '$lib/api/song';
  import type { SongSubmissionDto } from '$lib/api/song.submission';

  export let data;

  $: ({ user, api } = data);

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  let isRanked = false;
  let authorName = '';
  let levelType = 0;
  let level = '';
  let difficulty = '';
  let newCharterId: number | null = null;
  let newCharterDisplay = '';
  let queryCharter = false;
  let chart = '';
  let songSwitch = false;
  let parent: SongDto | SongSubmissionDto | undefined;

  $: charter = createQuery(
    api.user.info({ id: newCharterId ?? 0 }, { enabled: !!newCharterId && queryCharter }),
  );
  $: song = createQuery(api.song.listAll({ order: ['title'] }, { enabled: songSwitch }));
  $: songSubmission = createQuery(
    api.song.submission.listAll({ rangeOwnerId: [user?.id ?? 0] }, { enabled: !songSwitch }),
  );
  $: charterPreview = richtext(authorName ?? '');

  const loadChart = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      chart = URL.createObjectURL(target.files[0]);
    }
  };

  const resolveSong = (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
    parent =
      songSwitch && $song.isSuccess
        ? $song.data.data.find((value) => value.id === e.currentTarget.value)
        : $songSubmission.isSuccess
        ? $songSubmission.data.data.find((value) => value.id === e.currentTarget.value)
        : undefined;
  };
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload_chart')} | {$t('common.title')}</title>
</svelte:head>
<input type="checkbox" id="studio-charter" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-100 form-control gap-3">
    <div class="flex gap-3 items-center">
      <h3 class="font-bold text-lg">{$t('studio.submission.add_charter')}</h3>
      {#if user}
        <p class="opacity-80">
          ({$t('studio.submission.your_id')}{$t('common.colon')}{user.id})
        </p>
      {/if}
    </div>
    <label
      for="studio-charter"
      class="btn btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <div
      class={$charter.isError
        ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2 px-4'
        : 'w-full my-2 px-4'}
      data-tip={$charter.isError ? $t(`error.${$charter.error.code}`) : ''}
    >
      <label class="join w-full">
        <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('user.id')}</span>
        <input
          placeholder={$t('studio.submission.author_placeholder')}
          class={`input input-secondary join-item w-3/4 min-w-[180px] ${
            $charter.isError ? 'input-error' : 'input-secondary'
          }`}
          bind:value={newCharterId}
          on:input={() => {
            queryCharter = false;
          }}
        />
        <button
          class={`btn join-item ${
            newCharterId || $charter.isLoading
              ? $charter.isError
                ? 'btn-error'
                : 'btn-secondary btn-outline'
              : 'btn-disabled'
          }`}
          on:click={() => {
            queryCharter = true;
          }}
        >
          {$t('common.fetch')}
        </button>
      </label>
    </div>
    {#if newCharterId && $charter.isSuccess}
      <User id={newCharterId} initUser={$charter.data.data} kind="mini" target="_blank" />
      <label class="join w-full px-4">
        <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('common.form.charter')}</span>
        <input
          placeholder={$t('common.form.charter')}
          class="input input-secondary join-item w-3/4"
          bind:value={newCharterDisplay}
        />
      </label>
      <div class="modal-action mt-3 px-4">
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <label
          for="studio-charter"
          class="btn btn-secondary btn-outline"
          on:click={() => {
            authorName += `[PZUser:${newCharterId}:${newCharterDisplay}:PZRT]`;
          }}
          on:keyup
        >
          {$t('common.submit')}
        </label>
      </div>
    {/if}
  </div>
</div>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 pb-4 flex justify-center">
    <div class="w-3/4 max-w-6xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">{$t('studio.upload_chart')}</h1>
      <div class="card w-full bg-base-100 shadow-lg">
        <div class="card-body">
          <a
            href={`${PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=selfUploadChart&play=1&mode=preview&flag=adjustOffset&song=${encodeURI(
              parent?.file ?? '',
            )}&illustration=${encodeURI(parent?.illustration ?? '')}&name=${
              parent?.title
            }&level=${level}&difficulty=${
              parseFloat(difficulty) != 0 ? Math.floor(parseFloat(difficulty)) : '?'
            }&composer=${parent?.authorName}&illustrator=${
              parent?.illustrator
            }&charter=${authorName}`}
            target="_blank"
            class="mb-2 link link-hover"
          >
            {$t('studio.submission.offset_helper')}
          </a>
          <form method="POST" class="w-full form-control" enctype="multipart/form-data" use:enhance>
            <div class="flex">
              <span class="w-32 place-self-center">{$t('common.form.chart')}</span>
              <input
                type="file"
                id="file"
                name="File"
                accept=".json, .pec"
                class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                  $errors.File
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:input={loadChart}
              />
              {#if !!$errors.File}
                <span class="place-self-center w-2/3 text-error">{$errors.File}</span>
              {:else}
                <span class="place-self-center w-2/3">{$t('common.form.tips.chart')}</span>
              {/if}
            </div>
            <div class="flex justify-start items-center my-2 w-full">
              <span class="w-32 place-self-center">{$t('chart.ranked')}</span>
              <div class="flex w-1/3">
                <input
                  type="checkbox"
                  id="is_ranked"
                  name="IsRanked"
                  class="toggle {$errors.IsRanked ? 'toggle-error' : 'toggle-secondary'}"
                  bind:checked={isRanked}
                />
              </div>
              {#if !!$errors.IsRanked}
                <span class="place-self-center w-2/3 text-error">{$errors.IsRanked}</span>
              {:else}
                <span class="place-self-center w-2/3">
                  {$t(`common.form.tips.${isRanked ? 'ranked' : 'unranked'}`)}
                </span>
              {/if}
            </div>
            <div class="flex justify-start items-center my-2 w-full">
              <span class="w-32 place-self-center">{$t('studio.submission.song_type')}</span>
              <div class="flex w-1/3 gap-2">
                <input
                  type="radio"
                  bind:group={songSwitch}
                  name="SongSwitch"
                  value={true}
                  class="radio radio-secondary"
                />
                <p>{$t('song.song')}</p>
              </div>
              <div class="flex w-2/3 gap-2">
                <input
                  type="radio"
                  bind:group={songSwitch}
                  name="SongSwitch"
                  value={false}
                  class="radio radio-secondary"
                />
                <p>{$t('studio.song_submission')}</p>
              </div>
            </div>
            {#if songSwitch}
              <div
                class={$song.isError ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
                data-tip={$song.isError ? $t(`error.${$song.error.code}`) : ''}
              >
                <label class="join my-2 w-full">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('song.song')}
                  </span>
                  <select
                    id="song"
                    name="SongId"
                    class={`select select-secondary join-item w-3/4 min-w-[180px] ${
                      $song.isError ? 'select-error' : 'select-secondary'
                    }`}
                    value=""
                    on:input={resolveSong}
                  >
                    {#if $song.isSuccess}
                      {#each $song.data.data as song}
                        <option value={song.id}>
                          [{$t(`studio.submission.accessibilities.${song.accessibility}`)}]
                          {song.title} [{$t(`song.edition_types.${song.editionType}`)}{song.edition
                            ? ` (${song.edition})`
                            : ''}] - {song.authorName}
                        </option>
                      {/each}
                    {/if}
                  </select>
                </label>
              </div>
            {:else}
              <div
                class={$songSubmission.isError
                  ? 'tooltip tooltip-open tooltip-right tooltip-error'
                  : ''}
                data-tip={$songSubmission.isError ? $t(`error.${$songSubmission.error.code}`) : ''}
              >
                <label class="join my-2 w-full">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('studio.song_submission')}
                  </span>
                  <select
                    id="song_submission"
                    name="SongSubmissionId"
                    class={`select select-secondary join-item w-3/4 min-w-[180px] ${
                      $songSubmission.isError ? 'select-error' : 'select-secondary'
                    }`}
                    value=""
                    on:input={resolveSong}
                  >
                    {#if $songSubmission.isSuccess}
                      {#each $songSubmission.data.data as song}
                        <option value={song.id}>
                          {song.title} [{$t(`song.edition_types.${song.editionType}`)}{song.edition
                            ? ` (${song.edition})`
                            : ''}] - {song.authorName}
                        </option>
                      {/each}
                    {/if}
                  </select>
                </label>
              </div>
            {/if}
            <div
              class={$errors.Accessibility
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.Accessibility ? $errors.Accessibility : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.accessibility')}
                </span>
                <select
                  id="accessibility"
                  name="Accessibility"
                  class={`select select-secondary join-item w-3/4 ${
                    $errors.Accessibility ? 'select-error' : 'select-secondary'
                  }`}
                >
                  <option value="0">
                    {$t('common.accessibilities.0')} - {$t('chart.accessibility_tips.0')}
                  </option>
                  <option value="2">
                    {$t('common.accessibilities.2')} - {$t('chart.accessibility_tips.2')}
                  </option>
                </select>
              </label>
            </div>
            <div
              class={$errors.LevelType || $errors.Level
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.LevelType || $errors.Level
                ? $errors.LevelType ?? $errors.Level
                : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.chart_level')}
                </span>
                <select
                  id="level_type"
                  name="LevelType"
                  class={`select select-secondary join-item w-1/6 ${
                    $errors.LevelType ? 'select-error' : 'select-secondary'
                  }`}
                  bind:value={levelType}
                >
                  {#each LEVEL_TYPES as type, i}
                    <option value={i}>{type}</option>
                  {/each}
                </select>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="level"
                  name="Level"
                  placeholder={$t('common.form.tips.chart_level')}
                  class={`input input-secondary join-item w-7/12 min-w-[180px] ${
                    $errors.Level ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={level}
                />
              </label>
            </div>
            <div
              class={$errors.Difficulty ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Difficulty ? $errors.Difficulty : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.chart_difficulty_2')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="difficulty"
                  name="Difficulty"
                  placeholder={(Math.random() * (16.9 - 11.9) + 11.9).toFixed(1)}
                  class={`input input-secondary join-item w-3/4 min-w-[180px] ${
                    $errors.Difficulty ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={difficulty}
                />
              </label>
            </div>
            {#if level && difficulty}
              <div class="flex my-2">
                <span class="w-1/4 place-self-center">{$t('common.form.level_preview')}</span>
                <div class="w-3/4">
                  <button class={`btn ${getLevelColor(levelType)} btn-sm text-xl no-animation`}>
                    {level}
                    {parseFloat(difficulty) != 0 ? Math.floor(parseFloat(difficulty)) : '?'}
                  </button>
                </div>
              </div>
            {/if}
            <div
              class={$errors.AuthorName ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.AuthorName ? $errors.AuthorName : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.charter')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="author_name"
                  name="AuthorName"
                  placeholder={$t('common.form.charter')}
                  class={`input input-secondary join-item w-7/12 min-w-[180px] ${
                    $errors.AuthorName ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={authorName}
                />
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <label
                  for="studio-charter"
                  class="btn btn-outline btn-secondary join-item w-1/6"
                  on:click={() => {
                    newCharterId = null;
                    newCharterDisplay = '';
                  }}
                  on:keyup
                >
                  {$t('studio.submission.add_charter')}
                </label>
              </label>
            </div>
            {#if authorName}
              <div class="flex my-2">
                <span class="w-1/4 place-self-center">
                  {$t('common.form.charter_preview')}
                </span>
                <p class="w-3/4 content">
                  {@html $charterPreview}
                </p>
              </div>
            {/if}
            <div
              class={$errors.Description ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Description ? $errors.Description : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.description')}{$t('common.optional')}
                </span>
                <textarea
                  id="description"
                  name="Description"
                  class={`textarea join-item ${
                    $errors.Description ? 'textarea-error' : 'textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={$t('studio.submission.description_placeholder')}
                />
              </label>
            </div>
            <div class="w-full flex justify-center mt-6">
              <div
                class="tooltip tooltip-bottom tooltip-error w-full"
                class:tooltip-open={!!$message}
                data-tip={$message}
              >
                <button
                  type="submit"
                  class="btn {$allErrors.length > 0
                    ? 'btn-error'
                    : $submitting
                    ? 'btn-ghost'
                    : 'btn-primary btn-outline'} w-full"
                  disabled={$submitting || !chart}
                >
                  {$allErrors.length > 0
                    ? $t('common.error')
                    : $submitting
                    ? $t('common.waiting')
                    : $t('common.submit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
