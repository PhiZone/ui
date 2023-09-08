<script lang="ts">
  import { t } from '$lib/translations/config';
  import { LEVEL_TYPES, Status } from '$lib/constants';
  import User from '$lib/components/User.svelte';
  import { applyPatch, getLevelColor } from '$lib/utils';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { richtext } from '$lib/richtext';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import { invalidateAll } from '$app/navigation';
  import type { PatchElement } from '$lib/api/types';
  import type { ChartSubmissionDto } from '$lib/api/chart.submission';

  export let data;

  $: ({ id, user, api } = data);

  let chart: ChartSubmissionDto;
  let newCharterId: number | null = null;
  let newCharterDisplay = '';
  let queryCharter = false;
  let status = Status.WAITING;
  let errorCode = '';
  let errors: Map<string, string> | undefined = undefined;

  $: submission = createQuery(api.chart.submission.info({ id }));
  $: charter = createQuery(
    api.user.info({ id: newCharterId ?? 0 }, { enabled: !!newCharterId && queryCharter }),
  );
  $: charterPreview = richtext(chart.authorName ?? '');
  $: song = createQuery(
    api.song.info(
      { id: $submission.data?.data.songId ?? '' },
      { enabled: $submission.isSuccess && !!$submission.data.data.songId },
    ),
  );
  $: songSubmission = createQuery(
    api.song.submission.info(
      { id: $submission.data?.data.songSubmissionId ?? '' },
      { enabled: $submission.isSuccess && !!$submission.data.data.songSubmissionId },
    ),
  );
  $: parent = $song.isSuccess
    ? $song.data.data
    : $songSubmission.isSuccess
    ? $songSubmission.data.data
    : undefined;

  $: if (!chart && $submission.isSuccess) {
    chart = $submission.data.data;
  }

  const queryClient = useQueryClient();

  const handleChart = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      status = Status.SENDING;
      errorCode = '';
      const resp = await api.chart.submission.updateChart({ id, File: target.files[0] });
      if (resp.ok) {
        invalidateAll();
        await queryClient.invalidateQueries(['chart.submission.info', { id }]);
        status = Status.OK;
      } else {
        status = Status.ERROR;
        const data = await resp.json();
        errorCode = data.code;
        console.error(data);
      }
    }
  };

  let patch = new Array<PatchElement>();

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    errors = undefined;
    const resp = await api.chart.submission.update({ id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
      await queryClient.invalidateQueries(['chart.submission.info', { id }]);
      patch = [];
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      errors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(errors);
    }
  };
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.edit_chart')} | {$t('common.title')}</title>
</svelte:head>

<input type="checkbox" id="update-success" class="modal-toggle" checked={status === Status.OK} />
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{$t('common.success')}</h3>
    <p class="py-4">{$t('common.update_success')}</p>
    <div class="modal-action">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <btn
        class="btn btn-success btn-outline"
        on:click={() => {
          status = Status.WAITING;
        }}
        on:keyup
      >
        {$t('common.confirm')}
      </btn>
    </div>
  </div>
</div>

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
            chart.authorName += `[PZUser:${newCharterId}:${newCharterDisplay}:PZRT]`;
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
      <div class="flex justify-between">
        <h1 class="text-4xl font-bold mb-6">{$t('studio.edit_chart')}</h1>
        <a href="/studio/chart-submissions/{chart.id}" class="btn btn-secondary btn-outline">
          {$t('common.back')}
        </a>
      </div>
      <div class="card w-full bg-base-100 shadow-lg">
        <div class="card-body">
          <div class="text-5xl py-3 flex font-bold gap-4 items-center">
            {#if $song.isSuccess}
              <a
                class="hover:underline"
                href={`/songs/${$song.data.data.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {$song.data.data.title}
              </a>
            {:else if $songSubmission.isSuccess}
              <a
                class="hover:underline"
                href={`/studio/song-submissions/${$songSubmission.data.data.id}`}
                target="_blank"
                rel="noreferrer"
              >
                {$songSubmission.data.data.title}
              </a>
            {/if}
            <div class="join join-horizontal">
              <button class="btn {getLevelColor(chart.levelType)} join-item text-3xl no-animation">
                {chart.level}
                {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
              </button>
              {#if chart.isRanked}
                <button class="btn btn-success join-item text-3xl no-animation">
                  {$t('chart.ranked')}
                </button>
              {/if}
            </div>
          </div>
          <a
            href={`${PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&mode=preview&flag=adjustOffset&chart=${encodeURI(
              $submission.data?.data.file ?? '',
            )}&song=${encodeURI(parent?.file ?? '')}&illustration=${encodeURI(
              parent?.illustration ?? '',
            )}&name=${parent?.title}&level=${chart.level}&difficulty=${
              chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'
            }&composer=${parent?.authorName}&illustrator=${parent?.illustrator}&charter=${
              chart.authorName
            }`}
            target="_blank"
            class="mb-2 link link-hover"
          >
            {$t('studio.submission.offset_helper')}
          </a>
          <form class="w-full form-control">
            <div class="flex">
              <span class="w-32 place-self-center">{$t('common.form.chart')}</span>
              <input
                type="file"
                id="file"
                name="File"
                accept=".json, .pec"
                class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                  errors?.get('File')
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:input={handleChart}
              />
              {#if !!errors?.get('File')}
                <span class="place-self-center w-2/3 text-error">{errors?.get('File')}</span>
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
                  class="toggle {errors?.get('IsRanked') ? 'toggle-error' : 'toggle-secondary'}"
                  bind:checked={chart.isRanked}
                  on:input={() => {
                    patch = applyPatch(patch, 'replace', '/isRanked', !chart.isRanked);
                  }}
                />
              </div>
              {#if !!errors?.get('IsRanked')}
                <span class="place-self-center w-2/3 text-error">{errors?.get('IsRanked')}</span>
              {:else}
                <span class="place-self-center w-2/3">
                  {$t(`common.form.tips.${chart.isRanked ? 'ranked' : 'unranked'}`)}
                </span>
              {/if}
            </div>
            <div
              class={errors?.get('Accessibility')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('Accessibility')}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.accessibility')}
                </span>
                <select
                  id="accessibility"
                  name="Accessibility"
                  class={`select select-secondary join-item w-3/4 ${
                    errors?.get('Accessibility') ? 'select-error' : 'select-secondary'
                  }`}
                  on:input={(e) => {
                    patch = applyPatch(
                      patch,
                      'replace',
                      '/accessibility',
                      parseInt(e.currentTarget.value),
                    );
                  }}
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
              class={errors?.get('LevelType') || errors?.get('Level')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('LevelType') ?? errors?.get('Level') ?? ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.chart_level')}
                </span>
                <select
                  id="level_type"
                  name="LevelType"
                  class={`select select-secondary join-item w-1/6 ${
                    errors?.get('LevelType') ? 'select-error' : 'select-secondary'
                  }`}
                  bind:value={chart.levelType}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/levelType', e.currentTarget.value);
                  }}
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
                    errors?.get('Level') ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={chart.level}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/level', e.currentTarget.value);
                  }}
                />
              </label>
            </div>
            <div
              class={errors?.get('Difficulty')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('Difficulty')}
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
                    errors?.get('Difficulty') ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={chart.difficulty}
                  on:input={(e) => {
                    patch = applyPatch(
                      patch,
                      'replace',
                      '/difficulty',
                      parseFloat(e.currentTarget.value),
                    );
                  }}
                />
              </label>
            </div>
            <div
              class={errors?.get('AuthorName')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('AuthorName')}
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
                    errors?.get('AuthorName') ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={chart.authorName}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/authorName', e.currentTarget.value);
                  }}
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
            {#if chart.authorName}
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
              class={errors?.get('Description')
                ? 'tooltip tooltip-open tooltip-right tooltip-error relative my-2'
                : 'relative my-2'}
              data-tip={errors?.get('Description')}
            >
              <label class="join w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.description')}{$t('common.optional')}
                </span>
                <textarea
                  id="description"
                  name="Description"
                  class={`textarea join-item ${
                    errors?.get('Description') ? 'textarea-error' : 'textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={$t('studio.submission.description_placeholder')}
                  bind:value={chart.description}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/description', e.currentTarget.value);
                  }}
                />
              </label>
              <button
                type="button"
                class="absolute right-2 top-2 btn btn-accent btn-outline btn-sm backdrop-blur"
                on:click={() => {
                  chart.description = '';
                  patch = applyPatch(patch, 'remove', '/description');
                }}
              >
                {$t('common.empty_v')}
              </button>
            </div>
            <div class="w-full flex justify-center mt-6">
              <div
                class="tooltip tooltip-top tooltip-error w-full"
                class:tooltip-open={status === Status.ERROR}
                data-tip={status === Status.ERROR
                  ? $t(`error.${errorCode}`) ?? $t('common.unknown_error')
                  : null}
              >
                <button
                  class="btn {status === Status.ERROR
                    ? 'btn-error'
                    : status === Status.SENDING
                    ? 'btn-ghost'
                    : 'btn-secondary btn-outline'} w-full"
                  disabled={status == Status.SENDING}
                  on:click={update}
                >
                  {status === Status.ERROR
                    ? $t('common.error')
                    : status === Status.SENDING
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
