<script lang="ts">
  import { t } from '$lib/translations/config';
  import { LEVEL_TYPES, TAG_JOINER } from '$lib/constants';
  import User from '$lib/components/User.svelte';
  import { getLevelColor, getLevelDisplay } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import { createQuery } from '@tanstack/svelte-query';
  import { richtext } from '$lib/richtext';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import type { SongDto } from '$lib/api/song';
  import type { SongSubmissionDto } from '$lib/api';
  import Tag from '$lib/components/Tag.svelte';

  export let data;

  $: ({ user, api } = data);

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  let isRanked = false;
  let authorName = '';
  let levelType = 0;
  let level = '';
  let difficulty = '';
  let tagsRaw = '';
  let tags: string[] = [];
  let showTags = true;
  let newTag = '';
  let newCharterId: number | null = null;
  let newCharterDisplay = '';
  let queryCharter = false;
  let chart = '';
  let songSwitch = false;
  let parent: SongDto | SongSubmissionDto | undefined;

  let querySong = true;
  let newSongSearch: string;
  let newSongId: string | null = null;

  $: charter = createQuery(
    api.user.info({ id: newCharterId ?? 0 }, { enabled: !!newCharterId && queryCharter }),
  );
  $: songSearch = createQuery(
    api.song.listAll({ search: newSongSearch ?? undefined }, { enabled: querySong }),
  );
  $: songSubmission = createQuery(
    api.song.submission.listAll({ order: ['dateCreated'], desc: [true] }, { enabled: !songSwitch }),
  );
  $: charterPreview = richtext(authorName ?? '');
  $: existingTags = createQuery(
    api.tag.listAll(
      {
        rangeNormalizedName:
          tags.map((tag) => (tag ? tag.replace(/\s/g, '').toUpperCase() : '')) ?? undefined,
      },
      { enabled: !showTags && tags.length > 0 },
    ),
  );

  const loadChart = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      chart = URL.createObjectURL(target.files[0]);
    }
  };

  const resolveSong = (e: Event & { currentTarget: EventTarget & HTMLSelectElement }) => {
    parent =
      songSwitch && $songSearch.isSuccess
        ? $songSearch.data.data.find((value) => value.id === e.currentTarget.value)
        : $songSubmission.isSuccess
          ? $songSubmission.data.data.find((value) => value.id === e.currentTarget.value)
          : undefined;
  };
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload_chart')} | {$t('common.site_name')}</title>
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
      class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
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
          class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
            $charter.isError ? 'hover:input-error' : 'hover:input-secondary'
          }`}
          bind:value={newCharterId}
          on:input={() => {
            queryCharter = false;
          }}
        />
        <button
          class={`btn border-2 normal-border join-item ${
            newCharterId || $charter.isLoading
              ? $charter.isError
                ? 'btn-error'
                : 'hover:btn-secondary btn-outline'
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
          class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
          bind:value={newCharterDisplay}
        />
      </label>
      <div class="modal-action mt-3 px-4">
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <label
          for="studio-charter"
          class="btn border-2 normal-border btn-outline"
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

<div class="bg-base-300 min-h-screen">
  <div class="pt-32 pb-4 flex justify-center">
    <div class="w-3/4 max-w-6xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">{$t('studio.upload_chart')}</h1>
      <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
        <div class="card-body">
          <a
            href={`${PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=selfUploadChart&play=1&mode=preview&flag=adjustOffset&song=${encodeURI(
              parent?.file ?? '',
            )}&illustration=${encodeURI(parent?.illustration ?? '')}&name=${
              parent?.title
            }&level=${level}&difficulty=${getLevelDisplay(parseFloat(difficulty))}&composer=${
              parent?.authorName
            }&illustrator=${parent?.illustrator}&charter=${authorName}`}
            target="_blank"
            class="mb-2 link link-hover"
          >
            {$t('studio.submission.offset_helper')}
          </a>
          <form method="POST" class="w-full form-control" enctype="multipart/form-data" use:enhance>
            <div class="flex items-center my-2">
              <span class="w-32">{$t('common.form.chart')}</span>
              <input
                type="file"
                id="file"
                name="File"
                accept=".json, .pec"
                class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                  $errors.File
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:input={loadChart}
              />
              {#if !!$errors.File}
                <span class="w-2/3 text-error">{$errors.File}</span>
              {:else}
                <span class="w-2/3">{$t('common.form.tips.chart')}</span>
              {/if}
            </div>
            <div class="flex justify-start items-center my-2 w-full">
              <span class="w-32 place-self-center">{$t('chart.is_ranked')}</span>
              <div class="flex w-1/3">
                <input
                  type="checkbox"
                  id="is_ranked"
                  name="IsRanked"
                  class="toggle border-2 {$errors.IsRanked ? 'toggle-error' : 'toggle-secondary'}"
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
                  class="radio border-2 radio-secondary"
                />
                <p>{$t('song.song')}</p>
              </div>
              <div class="flex w-2/3 gap-2">
                <input
                  type="radio"
                  bind:group={songSwitch}
                  name="SongSwitch"
                  value={false}
                  class="radio border-2 radio-secondary"
                />
                <p>{$t('studio.song_submission')}</p>
              </div>
            </div>
            {#if songSwitch}
              <div
                class={$songSearch.isError
                  ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2'
                  : 'w-full my-2'}
                data-tip={$songSearch.isError ? $t(`error.${$songSearch.error.code}`) : ''}
              >
                <label class="join w-full">
                  <input
                    type="text"
                    placeholder={$t('common.search_placeholder', {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      resource: $t('common.songs').toLowerCase(),
                    })}
                    class={`input transition border-2 normal-border w-5/6 join-item min-w-[180px] ${
                      $songSearch.isError ? 'hover:input-error' : 'hover:input-secondary'
                    }`}
                    bind:value={newSongSearch}
                    on:input={() => {
                      querySong = false;
                    }}
                    on:keydown={(e) => {
                      if (e.key === 'Enter' && newSongSearch) {
                        e.preventDefault();
                        querySong = true;
                      }
                    }}
                  />
                  <button
                    type="button"
                    class={`btn border-2 normal-border w-1/6 join-item ${
                      $songSearch.isLoading
                        ? $songSearch.isError
                          ? 'btn-error'
                          : 'hover:btn-secondary btn-outline'
                        : 'btn-disabled'
                    }`}
                    on:click|preventDefault={() => {
                      querySong = true;
                    }}
                  >
                    <i class="fa-solid fa-magnifying-glass fa-lg"></i>
                  </button>
                </label>
              </div>
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-fit">
                  {$t('song.song')}
                </span>
                <select
                  id="song"
                  name="SongId"
                  class="select transition border-2 normal-border hover:select-secondary w-3/4 join-item"
                  bind:value={newSongId}
                  on:input={resolveSong}
                >
                  {#if $songSearch.isSuccess}
                    {#each $songSearch.data.data as song}
                      {@const composerText =
                        song.isOriginal && song.authorName
                          ? song.authorName.replaceAll(
                              /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
                              (_, __, ___, display) => display,
                            )
                          : song.authorName}
                      {#if [0, 1].includes(song.accessibility) || (user && song.ownerId === user.id)}
                        <option value={song.id}>
                          {`[${$t(
                            `studio.submission.accessibilities.${song.accessibility}`,
                          )}] ${composerText} - ${song.title} [${$t(
                            `song.edition_types.${song.editionType}`,
                          )}${song.edition ? ` (${song.edition})` : ''}]`}
                        </option>
                      {/if}
                    {/each}
                  {/if}
                </select>
              </label>
              <!-- <div
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
                    class={`select transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                      $song.isError ? 'hover:select-error' : 'hover:select-secondary'
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
              </div> -->
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
                    class={`select transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                      $songSubmission.isError ? 'hover:select-error' : 'hover:select-secondary'
                    }`}
                    value=""
                    on:input={resolveSong}
                  >
                    {#if $songSubmission.isSuccess}
                      {#each $songSubmission.data.data as song}
                        {@const composerText =
                          song.originalityProof && song.authorName
                            ? song.authorName.replaceAll(
                                /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
                                (_, __, ___, display) => display,
                              )
                            : song.authorName}
                        <option value={song.id}>
                          {composerText} - {song.title} [{$t(
                            `song.edition_types.${song.editionType}`,
                          )}{song.edition ? ` (${song.edition})` : ''}]
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
                  class={`select transition border-2 normal-border join-item w-3/4 ${
                    $errors.Accessibility ? 'hover:select-error' : 'hover:select-secondary'
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
                ? ($errors.LevelType ?? $errors.Level)
                : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.chart_level')}
                </span>
                <select
                  id="level_type"
                  name="LevelType"
                  class={`select transition border-2 normal-border join-item w-1/6 ${
                    $errors.LevelType ? 'hover:select-error' : 'hover:select-secondary'
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
                  class={`input transition border-2 normal-border join-item w-7/12 min-w-[180px] ${
                    $errors.Level ? 'hover:input-error' : 'hover:input-secondary'
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
                  class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                    $errors.Difficulty ? 'hover:input-error' : 'hover:input-secondary'
                  }`}
                  bind:value={difficulty}
                />
              </label>
            </div>
            {#if level && difficulty}
              <div class="flex my-2">
                <span class="w-1/4 place-self-center">{$t('common.form.level_preview')}</span>
                <div class="w-3/4">
                  <button
                    class={`btn ${getLevelColor(
                      levelType,
                    )} btn-sm text-xl cursor-default no-animation`}
                    on:click|preventDefault
                  >
                    {level}
                    {getLevelDisplay(parseFloat(difficulty))}
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
                  class={`input transition border-2 normal-border join-item w-7/12 min-w-[180px] ${
                    $errors.AuthorName ? 'hover:input-error' : 'hover:input-secondary'
                  }`}
                  bind:value={authorName}
                />
                <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                <label
                  for="studio-charter"
                  class="btn border-2 normal-border btn-outline hover:btn-secondary join-item w-1/6"
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
                <!-- <textarea
                  id="description"
                  name="Description"
                  class={`textarea transition border-2 normal-border join-item ${
                    $errors.Description ? 'hover:textarea-error' : 'hover:textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={$t('studio.submission.description_placeholder')}
                /> -->
                <textarea
                  id="description"
                  name="Description"
                  class={`textarea transition border-2 normal-border join-item ${
                    $errors.Description ? 'hover:textarea-error' : 'hover:textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={`${$t('common.description')}${$t('common.optional')}`}
                />
              </label>
            </div>
            <input type="hidden" id="tags" name="Tags" bind:value={tagsRaw} />
            <div
              class={$errors.Tags ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Tags ? $errors.Tags : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.tags')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (!newTag || tags.includes(newTag)) return;
                      showTags = false;
                      tags.push(newTag);
                      tagsRaw = tags.join(TAG_JOINER);
                      newTag = '';
                      setTimeout(() => {
                        showTags = true;
                      }, 0);
                    }
                  }}
                  id="new_tag"
                  class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                    $errors.Tags ? 'hover:input-error' : 'hover:input-secondary'
                  }`}
                  bind:value={newTag}
                />
                <button
                  class="btn border-2 normal-border btn-outline btn-square hover:btn-secondary join-item"
                  on:click|preventDefault={() => {
                    if (!newTag || tags.includes(newTag)) return;
                    showTags = false;
                    tags.push(newTag);
                    tagsRaw = tags.join(TAG_JOINER);
                    newTag = '';
                    setTimeout(() => {
                      showTags = true;
                    }, 0);
                  }}
                >
                  <i class="fa-solid fa-plus"></i>
                </button>
              </label>
            </div>
            {#if showTags}
              <div class="flex gap-1 flex-wrap">
                {#each tags as tag, i}
                  <Tag
                    {tag}
                    removeFunction={() => {
                      showTags = false;
                      tags.splice(i, 1);
                      tagsRaw = tags.join(TAG_JOINER);
                      setTimeout(() => {
                        showTags = true;
                      }, 0);
                    }}
                  />
                {/each}
              </div>
            {/if}
            {#if $existingTags.isSuccess && $existingTags.data.data.length > 0}
              <div class="flex my-2">
                <div class="w-1/4 flex flex-col gap-2">
                  <h2 class="text-lg font-bold">{$t('studio.submission.existing_tags')}</h2>
                  <p class="text-base">{$t('studio.submission.existing_tags_description')}</p>
                </div>
                <div class="w-3/4 result">
                  {#each $existingTags.data.data as tag}
                    <Tag {tag} full />
                  {/each}
                </div>
              </div>
            {/if}
            <div class="w-full flex flex-col justify-center mt-6">
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
                      : 'btn-outline border-2 normal-border'} w-full"
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
