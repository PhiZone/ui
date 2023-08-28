<script lang="ts">
  import { t } from '$lib/translations/config';
  import { ContentType, LEVEL_TYPES, Status } from '$lib/constants';
  import Charter from '$lib/components/User.svelte';
  import { getLevelColor } from '$lib/utils';
  import { error } from '@sveltejs/kit';
  import { superForm } from 'sveltekit-superforms/client';
  import { createQuery } from '@tanstack/svelte-query';

  export let data;

  $: ({ user, api } = data);

  const { form, enhance, message, errors, constraints, submitting, allErrors } = superForm(
    data.form,
  );

  let charterName = '';
  let newCharterId = 0;
  let newCharterDisplay = '';
  let queryCharter = false;
  let songSwitch = false;

  $: charter = createQuery(api.user.info({ id: newCharterId }, { enabled: queryCharter }));
  $: song = createQuery(api.song.listAll({rangeAccessibility: [0, 1]}, { enabled: songSwitch }));
  $: songSubmission = createQuery(
    api.song.submission.listAll(
      { rangeOwnerId: [user?.id ?? 0] },
      { enabled: !songSwitch },
    ),
  );
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
      class="btn btn-primary btn-outline btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <div
      class={$charter.isError
        ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2'
        : 'w-full my-2'}
      data-tip={$charter.isError ? $t(`error.${$charter.error.code}`) : ''}
    >
      <label class="join">
        <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('user.id')}</span>
        <input
          placeholder={$t('studio.submission.charter_placeholder')}
          class={`input input-bordered join-item w-3/4 min-w-[180px] ${
            $charter.isError
              ? 'input-error'
              : 'input-primary'
          }`}
          bind:value={newCharterId}
          on:input={() => {
            queryCharter = false;
          }}
        />
        <button
          class={`btn join-item ${
            newCharterId && $charter.isLoading
              ? $charter.isError
                ? 'btn-error'
                : 'btn-primary btn-outline'
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
      <Charter id={newCharterId} initUser={$charter.data.data} kind='mini' />
      <label class="join">
        <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('common.form.charter')}</span>
        <input
          placeholder={$t('common.form.charter')}
          class="input input-primary join-item w-3/4"
          bind:value={newCharterDisplay}
        />
      </label>
    {/if}
    <div class="modal-action mt-3 join join-horizontal">
      <label
        for="studio-charter"
        class="btn btn-primary btn-outline join-item text-lg"
        on:click={() => {
          charterName += `[PZUser:${newCharterId}:${newCharterDisplay}:PZRT]`;
        }}
        on:keyup
      >
        {$t('common.submit')}
      </label>
    </div>
  </div>
</div>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-6xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">{$t('studio.upload_chart')}</h1>
      <div class="card w-full bg-base-100 shadow-lg">
        <div class="card-body">
          <form method="POST" class="w-full form-control" use:enhance>
            <div class="flex">
              <span class="w-32 px-4 place-self-center">{$t('common.form.chart')}</span>
              <input
                type="file"
                id="file"
                name="File"
                accept=".json, .pec"
                class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                  !!$errors.File
                    ? 'input-error file:btn-error'
                    : 'input-primary file:btn-outline file:bg-primary'
                }`}
              />
              {#if !!$errors.File}
                <span class="place-self-center text-error">{$errors.File}</span>
              {:else}
                <span class="place-self-center">{$t('common.form.tips.chart')}</span>
              {/if}
            </div>
            <div class="flex justify-start items-center my-2">
              <span class="w-32 px-4 place-self-center">{$t('studio.submission.song_type')}</span>
              <div class="flex w-1/3 gap-2">
                <input
                  type="radio"
                  bind:group={songSwitch}
                  name="song-switch"
                  value={true}
                  class="radio radio-primary"
                />
                <p>{$t('song.song')}</p>
              </div>
              <div class="flex w-1/3 gap-2">
                <input
                  type="radio"
                  bind:group={songSwitch}
                  name="song-switch"
                  value={false}
                  class="radio radio-primary"
                />
                <p>{$t('studio.song_submission')}</p>
              </div>
            </div>
            {#if songSwitch}
              <div
                class={$song.isError
                  ? 'tooltip tooltip-open tooltip-right tooltip-error'
                  : ''}
                data-tip={$song.isError ? $t(`error.${$song.error.code}`) : ''}
              >
                <label class="join my-2">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('song.song')}
                  </span>
                  <select
                    class={`select select-bordered join-item w-3/4 min-w-[180px] ${
                      $song.isError
                        ? 'select-error'
                        : 'select-primary'
                    }`}
                  >
                    {#if $song.isSuccess}
                      {#each $song.data.data as song}
                        <option value={song.id}>
                          [{$t(`studio.submission.accessibilities.${song.accessibility}`)}] {song.id}.
                          {song.authorName} - {song.title} ({song.edition})
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
                <label class="join my-2">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('studio.song_submission')}
                  </span>
                  <select
                    class={`select select-bordered join-item w-3/4 min-w-[180px] ${
                      $songSubmission.isError
                        ? 'select-error'
                        : 'select-primary'
                    }`}
                  >
                    {#if $songSubmission.isSuccess}
                      {#each $songSubmission.data.data as song}
                        <option value={song.id}>
                          {song.id}. {song.authorName} - {song.title} ({song.edition})
                        </option>
                      {/each}
                    {/if}
                  </select>
                </label>
              </div>
            {/if}
            <div
              class={status === Status.ERROR && error?.level
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={status === Status.ERROR && error?.level ? error.level : ''}
            >
              <label class="join my-2">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.chart_level')}
                </span>
                <select
                  class={`select select-bordered join-item w-1/6 ${
                    (!levelType && dataIncomplete) || (status === Status.ERROR && error?.level_type)
                      ? 'select-error'
                      : 'select-primary'
                  }`}
                  bind:value={levelType}
                >
                  {#each LEVEL_TYPES as type, i}
                    <option value={i}>{type}</option>
                  {/each}
                </select>
                <input
                  type="text"
                  placeholder={$t('common.form.tips.chart_level')}
                  class={`input input-bordered join-item w-7/12 min-w-[180px] ${
                    (!level && dataIncomplete) || (status === Status.ERROR && error?.level)
                      ? 'input-error'
                      : 'input-primary'
                  }`}
                  bind:value={level}
                />
              </label>
            </div>
            <div
              class={status === Status.ERROR && error?.difficulty
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={status === Status.ERROR && error?.difficulty ? error.difficulty : ''}
            >
              <label class="join my-2">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.chart_difficulty_2')}
                </span>
                <input
                  type="text"
                  placeholder={(Math.random() * (16.9 - 11.9) + 11.9).toFixed(1)}
                  class={`input input-bordered join-item w-3/4 min-w-[180px] ${
                    (!difficulty && dataIncomplete) ||
                    (status === Status.ERROR && error?.difficulty)
                      ? 'input-error'
                      : 'input-primary'
                  }`}
                  bind:value={difficulty}
                />
              </label>
            </div>
            {#if level && difficulty}
              <div class="flex">
                <span class="w-1/4 px-4 place-self-center">{$t('common.form.level_preview')}</span>
                <div class="w-3/4">
                  <button class={`btn ${getLevelColor(levelType)} btn-sm text-xl no-animation`}>
                    {level}
                    {parseFloat(difficulty) != 0 ? Math.floor(parseFloat(difficulty)) : '?'}
                  </button>
                </div>
              </div>
            {/if}
            <div
              class={status === Status.ERROR && error?.charter
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={status === Status.ERROR && error?.charter ? error.charter : ''}
            >
              <label class="join my-2">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.charter')}
                </span>
                <input
                  type="text"
                  placeholder={$t('common.form.charter')}
                  class={`input input-bordered join-item w-7/12 min-w-[180px] ${
                    (!charter && dataIncomplete) || (status === Status.ERROR && error?.charter)
                      ? 'input-error'
                      : 'input-primary'
                  }`}
                  bind:value={charter}
                />
                <label
                  for="studio-charter"
                  class="btn btn-primary btn-outline join-item w-1/6"
                  on:click={() => {
                    newCharterId = null;
                    newCharter = null;
                    newCharterText = '';
                  }}
                  on:keyup
                >
                  {$t('studio.submission.add_charter')}
                </label>
              </label>
            </div>
            {#if charter}
              <div class="flex">
                <span class="w-1/4 px-4 place-self-center">
                  {$t('common.form.charter_preview')}
                </span>
                <p class="w-3/4 content">
                  {#each parseRichText(charter) as t}
                    {#if t.id > 0}
                      <a
                        href={`/users/${t.id}`}
                        class="text-accent hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t.text}
                      </a>
                    {:else}
                      {t.text}
                    {/if}
                  {/each}
                </p>
              </div>
            {/if}
            <div
              class={status === Status.ERROR && error?.description
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={status === Status.ERROR && error?.description ? error.description : ''}
            >
              <label class="join my-2">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.description')}{$t('common.optional')}
                </span>
                <textarea
                  class={`textarea join-item ${
                    status === Status.ERROR && error?.description
                      ? 'textarea-error'
                      : 'textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={$t('studio.submission.description_placeholder')}
                  bind:value={description}
                />
              </label>
            </div>
            <button
              class={`btn btn-outline ${
                status === Status.ERROR
                  ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error'
                  : status === Status.SENDING
                  ? 'btn btn-ghost btn-disabled'
                  : 'btn-primary'
              } float-right my-5 text-lg`}
              data-tip={$t(`common.form.errors.${errorMsg}`)}
              on:click={handleSubmit}
            >
              {$t(status === Status.SENDING ? 'common.waiting' : 'common.submit')}
            </button>
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
