<script lang="ts">
  import { t } from '$lib/translations/config';
  import * as api from '$lib/api';
  import { ContentType, Status } from '$lib/constants';
  import { goto } from '$app/navigation';
  import type { Song, ChartSubmissionError, SongSubmission, User } from '$lib/models';
  import Charter from '$lib/components/User.svelte';
  import { getLevelColor, parseRichText } from '$lib/utils';

  export let data: import('./$types').PageData;
  $: ({ content, access_token, user } = data);

  let errorMsg = '',
    levelType = -1,
    level = '',
    difficulty = '',
    charter = '',
    song = '',
    songSubmission = '',
    songSwitch = true,
    description = '',
    emptyDescription = false,
    chart: File | null = null,
    status = Status.OK,
    error: ChartSubmissionError,
    songList: Song[] | null = null,
    songSubmissionList: SongSubmission[],
    newCharterId: number | null = null,
    newCharter: User | null = null,
    newCharterStatus = Status.OK,
    newCharterErr = '',
    newCharterText = '';

  const levelTypes = ['EZ', 'HD', 'IN', 'AT', 'SP'];

  const getSongs = async () => {
    const resp = await api.GET('/songs/?order=-id&pagination=0', access_token, user);
    if (resp.ok) {
      songList = await resp.json();
    } else {
      console.log(await resp.json());
    }
  };

  const getSongSubmissions = async () => {
    const resp = await api.GET(
      `/song_uploads/?order=-id&uploader=${user.id}&pagination=0`,
      access_token,
      user,
    );
    if (resp.ok) {
      songSubmissionList = await resp.json();
    } else {
      console.log(await resp.json());
    }
  };

  const getUser = async () => {
    if (!newCharterId) {
      return;
    }
    newCharterStatus = Status.RETRIEVING;
    const resp = await api.GET(`/users/${newCharterId}/?query_relation=1`, access_token, user);
    if (resp.ok) {
      newCharter = await resp.json();
      newCharterStatus = Status.OK;
    } else {
      newCharterErr = (await resp.json()).detail;
      newCharterStatus = Status.ERROR;
    }
  };

  const handleChart = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    if (error?.chart) error.chart = [];
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      chart = target.files[0];
    }
  };

  async function handleSubmit() {
    let formData = new FormData();
    if (chart) formData.append('chart', chart as unknown as File);
    if (levelType !== -1) formData.append('level_type', levelType.toString());
    if (level) formData.append('level', level);
    if (difficulty) formData.append('difficulty', parseFloat(difficulty).toFixed(1));
    if (charter) formData.append('charter', charter);
    if ((songSwitch && song) || (!songSwitch && songSubmission))
      formData.append(songSwitch ? 'song' : 'song_upload', songSwitch ? song : songSubmission);
    if (emptyDescription || description) formData.append('description', description);
    status = Status.SENDING;
    const resp = await api.PATCH(
      `/chart_uploads/${content?.id}/`,
      formData,
      access_token,
      user,
      ContentType.FORM_DATA,
    );
    if (resp.ok) {
      window.location.href = `/studio/chart-submissions/${content?.id}`;
    } else {
      error = await resp.json();
      console.log(error);
      if (resp.status == 400) {
        errorMsg = 'data_invalid';
      } else {
        errorMsg = 'unknown_error';
      }
      status = Status.ERROR;
    }
  }
</script>

<svelte:head>
  <title>
    {$t('studio.chart_submission')} - {content?.song
      ? content?.song.name
      : content?.song_upload?.name}
    {content
      ? `[${content.level} ${content.difficulty != 0 ? Math.floor(content.difficulty) : '?'}]`
      : ''} - {$t('common.edit')} | {$t('common.title')}
  </title>
</svelte:head>

{#if content !== null}
  <input type="checkbox" id="studio-charter" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 form-control gap-3">
      <div class="flex gap-3 items-center">
        <h3 class="font-bold text-lg">{$t('studio.submission.add_charter')}</h3>
        <p class="opacity-80">
          ({$t('studio.submission.your_id')}{$t('common.colon')}{user.id})
        </p>
      </div>
      <label
        for="studio-charter"
        class="btn btn-primary btn-outline btn-sm btn-circle absolute right-2 top-2"
      >
        ✕
      </label>
      <div
        class={newCharterStatus === Status.ERROR && newCharterErr
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2'
          : 'w-full my-2'}
        data-tip={newCharterStatus === Status.ERROR && newCharterErr ? newCharterErr : ''}
      >
        <label class="join">
          <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('user.id')}</span>
          <input
            placeholder={$t('studio.submission.charter_placeholder')}
            class="input input-bordered join-item w-3/4 min-w-[180px] {newCharterStatus ===
              Status.ERROR && newCharterErr
              ? 'input-error'
              : 'input-primary'}"
            bind:value={newCharterId}
            on:input={() => {
              newCharterStatus = Status.OK;
            }}
          />
          <button
            class={`btn ${
              newCharterId && newCharterStatus !== Status.RETRIEVING
                ? newCharterStatus === Status.ERROR
                  ? 'btn-error'
                  : 'btn-primary btn-outline'
                : 'btn-disabled'
            }`}
            on:click={getUser}
          >
            {$t('common.fetch')}
          </button>
        </label>
      </div>
      {#if newCharter !== null && newCharterStatus === Status.OK}
        <Charter user={newCharter} token={access_token} operator={user} mini />
        <label class="join">
          <span class="btn no-animation join-item w-1/4 min-w-fit">
            {$t('common.form.charter')}
          </span>
          <input
            placeholder={$t('common.form.charter')}
            class="input input-primary join-item w-3/4"
            bind:value={newCharterText}
          />
        </label>
      {/if}
      <div class="modal-action mt-3 join join-horizontal">
        <label
          for="studio-charter"
          class="btn btn-primary btn-outline join-item text-lg"
          on:click={() => {
            charter += `[PZUser:${newCharter?.id}:${newCharterText}:PZRT]`;
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
        <h1 class="text-4xl font-bold mb-6">
          {$t('studio.chart_submission')} - {$t('common.edit')}
        </h1>
        <div class="card w-full bg-base-100 shadow-lg">
          <div class="card-body">
            <div
              class="form-control"
              on:focusin={() => {
                status = Status.OK;
              }}
            >
              {#if content.chart}
                <div class="flex justify-start items-center my-2">
                  <span class="w-32 px-4 place-self-center">
                    {$t('studio.submission.original_chart')}
                  </span>
                  <a
                    href={content.chart}
                    target="_blank"
                    rel="noreferrer"
                    class="hover:underline place-self-center min-w-fit mr-4"
                    download
                  >
                    {$t('common.download')}
                  </a>
                </div>
              {/if}
              <div class="flex">
                <span class="w-32 px-4 place-self-center">{$t('common.form.chart')}</span>
                <input
                  type="file"
                  accept=".json, .pec"
                  class={`mb-2 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                    status === Status.ERROR && error?.chart
                      ? 'input-error file:btn-error'
                      : 'input-primary file:btn-outline file:bg-primary'
                  }`}
                  on:change={handleChart}
                />
                {#if status === Status.ERROR && error?.chart}
                  <span class="place-self-center text-error">{error.chart}</span>
                {:else}
                  <span class="place-self-center">{$t('common.form.tips.chart')}</span>
                {/if}
              </div>
              <div class="flex justify-start items-center my-2">
                <span class="w-32 px-4 place-self-center">
                  {$t('studio.submission.original_song')}
                </span>
                {#if content.song}
                  <a
                    href={`/songs/${content.song.id}`}
                    class="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    [{$t('song.song')}] [{$t(
                      `studio.submission.accessibilities.${content.song.accessibility}`,
                    )}] {content.song.id}. {content.song.composer} - {content.song.name} ({content
                      .song.edition})
                  </a>
                {:else}
                  <a
                    href={`/studio/song-submissions/${content.song_upload?.id}`}
                    class="hover:underline"
                  >
                    [{$t('studio.song_submission')}] {content.song_upload?.id}. {content.song_upload
                      ?.composer} - {content.song_upload?.name} ({content.song_upload?.edition})
                  </a>
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
                    on:change={getSongs}
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
                    on:change={getSongSubmissions}
                  />
                  <p>{$t('studio.song_submission')}</p>
                </div>
              </div>
              {#if songSwitch}
                <div
                  class={status === Status.ERROR && error?.song
                    ? 'tooltip tooltip-open tooltip-right tooltip-error'
                    : ''}
                  data-tip={status === Status.ERROR && error?.song ? error.song : ''}
                  on:pointerenter={() => {
                    if (songList === null) {
                      getSongs();
                    }
                  }}
                >
                  <label class="join my-2">
                    <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                      {$t('song.song')}
                    </span>
                    <select
                      class="select select-bordered join-item w-3/4 min-w-[180px] {status ===
                        Status.ERROR && error?.song
                        ? 'select-error'
                        : 'select-primary'}"
                      bind:value={song}
                    >
                      {#if songList}
                        {#each songList as song}
                          <option value={song.id}>
                            [{$t(`studio.submission.accessibilities.${song.accessibility}`)}] {song.id}.
                            {song.composer} - {song.name} ({song.edition})
                          </option>
                        {/each}
                      {/if}
                    </select>
                  </label>
                </div>
              {:else}
                <div
                  class={status === Status.ERROR && error?.song_upload
                    ? 'tooltip tooltip-open tooltip-right tooltip-error'
                    : ''}
                  data-tip={status === Status.ERROR && error?.song_upload ? error.song_upload : ''}
                >
                  <label class="join my-2">
                    <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                      {$t('studio.song_submission')}
                    </span>
                    <select
                      class="select select-bordered join-item w-3/4 min-w-[180px] {status ===
                        Status.ERROR && error?.song_upload
                        ? 'select-error'
                        : 'select-primary'}"
                      bind:value={songSubmission}
                    >
                      {#if songSubmissionList}
                        {#each songSubmissionList as song}
                          <option value={song.id}>
                            {song.id}. {song.composer} - {song.name} ({song.edition})
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
                    class="select select-bordered join-item w-1/6 {status === Status.ERROR &&
                    error?.level_type
                      ? 'select-error'
                      : 'select-primary'}"
                    bind:value={levelType}
                  >
                    {#each levelTypes as type, i}
                      <option value={i}>{type}</option>
                    {/each}
                  </select>
                  <input
                    type="text"
                    placeholder={$t('common.form.tips.chart_level')}
                    class="input input-bordered join-item w-7/12 min-w-[180px] {status ===
                      Status.ERROR && error?.level
                      ? 'input-error'
                      : 'input-primary'}"
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
                    placeholder={content.difficulty.toFixed(1)}
                    class={`input input-bordered join-item w-3/4 min-w-[180px] ${
                      status === Status.ERROR && error?.difficulty ? 'input-error' : 'input-primary'
                    }`}
                    bind:value={difficulty}
                  />
                </label>
              </div>
              {#if level && difficulty}
                <div class="flex">
                  <span class="w-1/4 px-4 place-self-center">
                    {$t('common.form.level_preview')}
                  </span>
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
                    placeholder={content.charter}
                    class={`input input-bordered join-item w-7/12 min-w-[180px] ${
                      status === Status.ERROR && error?.charter ? 'input-error' : 'input-primary'
                    }`}
                    bind:value={charter}
                  />
                  <label
                    for="studio-charter"
                    class="btn btn-primary btn-outline join-item w-1/6 min-w-fit"
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
                  <p class="w-3/4 px-4 content">
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
                  ? 'tooltip tooltip-open tooltip-right tooltip-error relative'
                  : 'relative'}
                data-tip={status === Status.ERROR && error?.description ? error.description : ''}
              >
                <label class="join my-2">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('common.description')}
                  </span>
                  <textarea
                    class={`textarea ${
                      status === Status.ERROR && error?.description
                        ? 'textarea-error'
                        : 'textarea-secondary'
                    } w-3/4 h-28`}
                    placeholder={!emptyDescription ? content.description : ''}
                    bind:value={description}
                    on:input={() => {
                      emptyDescription = false;
                    }}
                  />
                </label>
                <button
                  class="absolute right-0 top-2 btn btn-accent btn-outline btn-sm"
                  on:click={() => {
                    emptyDescription = true;
                    description = '';
                  }}
                >
                  {$t('common.empty_v')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          class={`btn btn-outline ${
            status === Status.ERROR
              ? 'btn-disabled tooltip tooltip-open tooltip-left tooltip-error'
              : status === Status.SENDING
              ? 'btn btn-ghost btn-disabled glass'
              : 'btn-primary'
          } glass float-right my-5 text-lg`}
          data-tip={$t(`common.form.errors.${errorMsg}`)}
          on:click={handleSubmit}
        >
          {$t(status === Status.SENDING ? 'common.waiting' : 'common.submit')}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
