<script lang="ts">
  import { t } from '$lib/translations/config';
  import { Status } from '$lib/constants';
  import User from '$lib/components/User.svelte';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { richtext } from '$lib/richtext';
  import noUiSlider, { type API } from 'nouislider';
  import 'nouislider/dist/nouislider.css';
  import { applyPatch, convertTime, parseTime } from '$lib/utils';
  import type { SongSubmissionDto } from '$lib/api/song.submission';
  import { invalidateAll } from '$app/navigation';
  import type { PatchElement } from '$lib/api/types';
  import { onMount } from 'svelte';

  export let data;

  $: ({ id, user, api } = data);

  interface TargetElement extends HTMLElement {
    noUiSlider?: API;
  }

  let song: SongSubmissionDto;
  let isOriginal = false;
  let audio: HTMLAudioElement | undefined;
  let slider: TargetElement;
  let showPreview = 0;
  let previewStatus = 0;
  let previewTimer: NodeJS.Timeout;
  let previewTimeout: NodeJS.Timeout;
  let previewTime = 0;
  let newComposerId: number | null = null;
  let newComposerDisplay = '';
  let queryComposer = false;
  let status = Status.WAITING;
  let errorCode = '';
  let errors: Map<string, string> | undefined = undefined;

  $: submission = createQuery(api.song.submission.info({ id }));
  $: composer = createQuery(
    api.user.info({ id: newComposerId ?? 0 }, { enabled: !!newComposerId && queryComposer }),
  );
  $: composerPreview = richtext(song.authorName ?? '');

  $: if (!song && $submission.isSuccess) {
    song = $submission.data.data;
    isOriginal = !!song.originalityProof;
  }

  onMount(() => {
    if (song) {
      createAudio(song.file);
    }
  });

  const queryClient = useQueryClient();

  const handlePreview = () => {
    pausePreview();
    previewStatus = 0;
    const values = slider.noUiSlider?.get() as string[];
    song.previewStart = convertTime(parseFloat(values[0]));
    song.previewEnd = convertTime(parseFloat(values[1]));
    previewTime = parseTime(song.previewStart);
  };

  const handleAudio = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      createAudio(URL.createObjectURL(target.files[0]), true);
    }
  };

  const createAudio = (url: string, resetPreview = false) => {
    audio = new Audio(url);
    showPreview = 1;
    audio.addEventListener('loadedmetadata', () => {
      if (!audio) return;
      showPreview = 2;
      audio.volume = 0.5;
      slider.noUiSlider?.destroy();
      noUiSlider.create(slider, {
        start: [
          !resetPreview ? parseTime(song.previewStart) : 0.2 * audio.duration,
          !resetPreview ? parseTime(song.previewEnd) : 0.8 * audio.duration,
        ],
        connect: true,
        range: {
          min: 0,
          max: audio.duration,
        },
      });
      handlePreview();
      slider.noUiSlider?.on('slide', handlePreview);
      slider.noUiSlider?.on('set', () => {
        patch = applyPatch(patch, 'replace', '/previewStart', parsePreviewTime(song.previewStart));
        patch = applyPatch(patch, 'replace', '/previewEnd', parsePreviewTime(song.previewEnd));
      });
    });
  };

  const handlePreviewPlay = () => {
    if (!audio) return;
    if (previewStatus == 0) {
      audio.currentTime = parseTime(song.previewStart);
      previewTime = parseTime(song.previewStart);
    }
    if (previewStatus == 2) {
      pausePreview();
      previewStatus = 1;
    } else {
      previewTimer = setInterval(() => {
        previewTime = audio ? audio.currentTime : 0;
      }, 10);
      previewTimeout = setTimeout(
        () => {
          if (!audio) return;
          pausePreview();
          audio.currentTime = parseTime(song.previewStart);
          previewStatus = 0;
        },
        (parseTime(song.previewEnd) - previewTime) * 1e3,
      );
      audio.play();
      previewStatus = 2;
    }
  };

  const pausePreview = () => {
    if (!audio) return;
    audio.pause();
    clearTimeout(previewTimeout);
    clearInterval(previewTimer);
  };

  const handleFile = async (
    e: Event & { currentTarget: EventTarget & HTMLInputElement },
    type = 'file',
  ) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      status = Status.SENDING;
      errorCode = '';
      const resp = await api.song.submission.updateFile(type, { id, File: target.files[0] });
      if (resp.ok) {
        invalidateAll();
        await queryClient.invalidateQueries(['song.submission.info', { id }]);
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

  const parsePreviewTime = (time: string) => {
    return /^\d{1,2}:\d{1,2}.\d+$/g.test(time) ? `00:${time}` : time;
  };

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    errors = undefined;
    const resp = await api.song.submission.update({ id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
      await queryClient.invalidateQueries(['song.submission.info', { id }]);
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
  <title>{$t('common.studio')} - {$t('studio.edit_song')} | {$t('common.title')}</title>
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

<input type="checkbox" id="studio-composer" class="modal-toggle" />
<div class="modal">
  <div class="modal-box bg-base-100 form-control gap-3">
    <div class="flex gap-3 items-center">
      <h3 class="font-bold text-lg">{$t('studio.submission.add_composer')}</h3>
      {#if user}
        <p class="opacity-80">
          ({$t('studio.submission.your_id')}{$t('common.colon')}{user.id})
        </p>
      {/if}
    </div>
    <label
      for="studio-composer"
      class="btn btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
    >
      ✕
    </label>
    <div
      class={$composer.isError
        ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-full my-2 px-4'
        : 'w-full my-2 px-4'}
      data-tip={$composer.isError ? $t(`error.${$composer.error.code}`) : ''}
    >
      <label class="join w-full">
        <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('user.id')}</span>
        <input
          placeholder={$t('studio.submission.author_placeholder')}
          class={`input input-secondary join-item w-3/4 min-w-[180px] ${
            $composer.isError ? 'input-error' : 'input-secondary'
          }`}
          bind:value={newComposerId}
          on:input={() => {
            queryComposer = false;
          }}
        />
        <button
          class={`btn join-item ${
            newComposerId || $composer.isLoading
              ? $composer.isError
                ? 'btn-error'
                : 'btn-secondary btn-outline'
              : 'btn-disabled'
          }`}
          on:click={() => {
            queryComposer = true;
          }}
        >
          {$t('common.fetch')}
        </button>
      </label>
    </div>
    {#if newComposerId && $composer.isSuccess}
      <User id={newComposerId} initUser={$composer.data.data} kind="mini" target="_blank" />
      <label class="join w-full px-4">
        <span class="btn no-animation join-item w-1/4 min-w-fit">{$t('common.form.composer')}</span>
        <input
          placeholder={$t('common.form.composer')}
          class="input input-secondary join-item w-3/4"
          bind:value={newComposerDisplay}
        />
      </label>
      <div class="modal-action mt-3 px-4">
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <label
          for="studio-composer"
          class="btn btn-secondary btn-outline"
          on:click={() => {
            song.authorName += `[PZUser:${newComposerId}:${newComposerDisplay}:PZRT]`;
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
        <h1 class="text-4xl font-bold mb-6">{$t('studio.edit_song')}</h1>
        <a href="/studio/song-submissions/{song.id}" class="btn btn-secondary btn-outline">
          {$t('common.back')}
        </a>
      </div>
      <div class="card w-full bg-base-100 shadow-lg">
        <div class="card-body">
          <form class="w-full form-control">
            <div class="flex justify-start items-center my-2 w-full">
              <span class="w-32 place-self-center">{$t('song.original')}</span>
              <div class="flex w-1/3">
                <input
                  type="checkbox"
                  class="toggle toggle-secondary"
                  bind:checked={isOriginal}
                  on:change={() => {
                    if (isOriginal) {
                      if (song.editionType > 2) {
                        song.editionType = 0;
                      }
                      if (/\[PZUser:(\d+):(.+?):PZRT\]/gi.test(song.authorName)) {
                        song.authorName = '';
                      }
                    }
                  }}
                />
              </div>
              <span class="place-self-center w-2/3">
                {$t(`common.form.tips.${isOriginal ? 'original' : 'reposted'}`)}
              </span>
            </div>
            <div class="flex">
              <span class="w-32 place-self-center">{$t('common.form.audio')}</span>
              <input
                type="file"
                id="file"
                name="File"
                accept=".mp3, .wav, .flac, .ogg"
                class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                  errors?.get('File')
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:change={handleAudio}
                on:input={handleFile}
              />
              {#if !!errors?.get('File')}
                <span class="place-self-center w-2/3 text-error">{errors?.get('File')}</span>
              {:else}
                <span class="place-self-center w-2/3">{$t('common.form.tips.audio')}</span>
              {/if}
            </div>
            <div class="flex">
              <span class="w-32 place-self-center">{$t('common.form.illustration')}</span>
              <input
                type="file"
                id="illustration"
                name="Illustration"
                accept=".jpg, .jpeg, .png, .webp"
                class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                  errors?.get('Illustration')
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:input={(e) => {
                  handleFile(e, 'illustration');
                }}
              />
              {#if !!errors?.get('Illustration')}
                <span class="place-self-center w-2/3 text-error">
                  {errors?.get('Illustration')}
                </span>
              {:else}
                <span class="place-self-center w-2/3">{$t('common.form.tips.illustration')}</span>
              {/if}
            </div>
            {#if isOriginal}
              <div class="flex">
                <span class="w-32 place-self-center">
                  {$t('common.form.originality_proof')}
                </span>
                <input
                  type="file"
                  id="originality_proof"
                  name="OriginalityProof"
                  accept=".zip"
                  class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                    errors?.get('OriginalityProof')
                      ? 'input-error file:btn-error'
                      : 'input-secondary file:btn-outline file:bg-secondary'
                  }`}
                  on:input={(e) => {
                    handleFile(e, 'originalityProof');
                  }}
                />
                {#if !!errors?.get('OriginalityProof')}
                  <span class="place-self-center w-2/3 text-error">
                    {errors?.get('OriginalityProof')}
                  </span>
                {:else}
                  <span class="place-self-center w-2/3">
                    {$t('common.form.tips.originality_proof')}
                  </span>
                {/if}
              </div>
            {/if}
            {#if song.editionType === 3}
              <div class="flex">
                <span class="w-32 place-self-center">{$t('common.form.license')}</span>
                <input
                  type="file"
                  id="license"
                  name="License"
                  accept=".jpg, .jpeg, .png, .webp"
                  class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                    errors?.get('License')
                      ? 'input-error file:btn-error'
                      : 'input-secondary file:btn-outline file:bg-secondary'
                  }`}
                  on:input={(e) => {
                    handleFile(e, 'license');
                  }}
                />
                {#if !!errors?.get('License')}
                  <span class="place-self-center w-2/3 text-error">{errors?.get('License')}</span>
                {:else}
                  <span class="place-self-center w-2/3">{$t('common.form.tips.license')}</span>
                {/if}
              </div>
            {/if}
            {#if showPreview}
              <div class="flex">
                <span class="w-32 place-self-center">{$t('common.form.song_preview')}</span>
                <div class="flex w-full gap-2">
                  <div class="tooltip place-self-center" data-tip={convertTime(previewTime)}>
                    {#if previewStatus == 2}
                      <button
                        type="button"
                        class="btn btn-secondary btn-square btn-sm btn-outline"
                        on:click={handlePreviewPlay}
                      >
                        <i class="fa-solid fa-pause fa-xl"></i>
                      </button>
                    {:else}
                      <button
                        type="button"
                        class="btn btn-secondary btn-square btn-sm btn-outline"
                        on:click={handlePreviewPlay}
                      >
                        <i class="fa-solid fa-play fa-lg"></i>
                      </button>
                    {/if}
                  </div>
                  {#if !errors?.get('PreviewStart') && !errors?.get('PreviewEnd') && showPreview === 2}
                    <input
                      type="text"
                      id="preview_start"
                      name="PreviewStart"
                      on:keydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      placeholder={$t('studio.submission.start')}
                      class="input w-1/6 text-right"
                      value={convertTime(song.previewStart)}
                      on:input={(e) => {
                        if (!/^(\d{1,2}:)?\d{1,2}:\d{1,2}.\d+$/g.test(e.currentTarget.value))
                          return;
                        song.previewStart = convertTime(parseTime(e.currentTarget.value));
                        if (
                          parseTime(song.previewStart) < 0 ||
                          parseTime(song.previewStart) > parseTime(song.previewEnd) ||
                          (audio && parseTime(song.previewStart) > audio.duration)
                        )
                          return;
                        pausePreview();
                        previewStatus = 0;
                        previewTime = parseTime(song.previewStart);
                        slider.noUiSlider?.set([
                          parseTime(song.previewStart),
                          parseTime(song.previewEnd),
                        ]);
                      }}
                    />
                  {/if}
                  <div class="slider place-self-center w-2/3" bind:this={slider} />
                  {#if !!errors?.get('PreviewStart') || !!errors?.get('PreviewEnd')}
                    <span class="place-self-center w-1/3 text-error">
                      {errors?.get('PreviewStart') ?? errors?.get('PreviewEnd')}
                    </span>
                  {:else if showPreview === 2}
                    <input
                      type="text"
                      id="preview_end"
                      name="PreviewEnd"
                      on:keydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      placeholder={$t('studio.submission.end')}
                      class="input w-1/6 text-left"
                      value={convertTime(song.previewEnd)}
                      on:input={(e) => {
                        if (!/^(\d{1,2}:)?\d{1,2}:\d{1,2}.\d+$/g.test(e.currentTarget.value))
                          return;
                        song.previewEnd = convertTime(parseTime(e.currentTarget.value));
                        if (
                          parseTime(song.previewEnd) < 0 ||
                          parseTime(song.previewStart) > parseTime(song.previewEnd) ||
                          (audio && parseTime(song.previewEnd) > audio.duration)
                        )
                          return;
                        pausePreview();
                        previewStatus = 0;
                        slider.noUiSlider?.set([
                          parseTime(song.previewStart),
                          parseTime(song.previewEnd),
                        ]);
                      }}
                    />
                  {/if}
                </div>
              </div>
            {/if}
            <div
              class={errors?.get('Title') ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={errors?.get('Title')}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.song_title')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="title"
                  name="Title"
                  placeholder={$t('common.form.song_title')}
                  class={`input input-secondary join-item w-3/4 min-w-[180px] ${
                    errors?.get('Title') ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={song.title}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/title', e.currentTarget.value);
                  }}
                />
              </label>
            </div>
            <div
              class={errors?.get('EditionType') || errors?.get('Edition')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('EditionType') ?? errors?.get('Edition')}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.song_edition')}
                </span>
                <select
                  id="edition_type"
                  name="EditionType"
                  class={`select select-secondary join-item ${
                    song.editionType === 0 ? 'w-3/4' : 'w-1/6'
                  } ${errors?.get('EditionType') ? 'select-error' : 'select-secondary'}`}
                  bind:value={song.editionType}
                  on:input={(e) => {
                    patch = applyPatch(
                      patch,
                      'replace',
                      '/editionType',
                      parseInt(e.currentTarget.value),
                    );
                  }}
                >
                  {#each [...Array(3).keys()] as i}
                    <option value={i}>{$t(`song.edition_types.${i}`)}</option>
                  {/each}
                  {#if !isOriginal}
                    {#each [...Array(3).keys()] as i}
                      <option value={i + 3}>{$t(`song.edition_types.${i + 3}`)}</option>
                    {/each}
                  {/if}
                </select>
                {#if song.editionType !== 0}
                  <input
                    type="text"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="edition"
                    name="Edition"
                    placeholder={$t('studio.submission.edition_placeholder')}
                    class={`input input-secondary join-item w-7/12 min-w-[180px] ${
                      errors?.get('Edition') ? 'input-error' : 'input-secondary'
                    }`}
                    bind:value={song.edition}
                    on:input={(e) => {
                      patch = applyPatch(patch, 'replace', '/edition', e.currentTarget.value);
                    }}
                  />
                {/if}
              </label>
            </div>
            {#if song.edition}
              <div class="flex my-2">
                <span class="w-1/4 place-self-center">
                  {$t('common.form.edition_preview')}
                </span>
                <div class="w-3/4">
                  <button
                    type="button"
                    class="btn btn-xs btn-neutral text-sm font-normal no-animation"
                  >
                    {$t(`song.edition_types.${song.editionType}`)}
                  </button>
                  {#if song.edition}
                    {song.edition}
                  {/if}
                </div>
              </div>
            {/if}
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
                  value={`${song.accessibility}`}
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
                    {$t('common.accessibilities.0')} - {$t('song.accessibility_tips.0')}
                  </option>
                  {#if isOriginal || song.editionType === 3}
                    <option value="1">
                      {$t('common.accessibilities.1')} - {$t('song.accessibility_tips.1')}
                    </option>
                    <option value="2">
                      {$t('common.accessibilities.2')} - {$t('song.accessibility_tips.2')}
                    </option>
                  {/if}
                </select>
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
                  {$t('common.form.composer')}
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
                  placeholder={$t('common.form.composer')}
                  class={`input input-secondary join-item ${
                    isOriginal ? 'w-7/12' : 'w-9/12'
                  } min-w-[180px] ${errors?.get('AuthorName') ? 'input-error' : 'input-secondary'}`}
                  bind:value={song.authorName}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/authorName', e.currentTarget.value);
                  }}
                />
                {#if isOriginal}
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  <label
                    for="studio-composer"
                    class="btn btn-outline btn-secondary join-item w-1/6"
                    on:click={() => {
                      newComposerId = null;
                      newComposerDisplay = '';
                    }}
                    on:keyup
                  >
                    {$t('studio.submission.add_composer')}
                  </label>
                {/if}
              </label>
            </div>
            {#if isOriginal && song.authorName}
              <div class="flex my-2">
                <span class="w-1/4 place-self-center">
                  {$t('common.form.composer_preview')}
                </span>
                <p class="w-3/4 content">
                  {@html $composerPreview}
                </p>
              </div>
            {/if}
            <div
              class={errors?.get('Illustrator')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('Illustrator')}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.illustrator')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="illustrator"
                  name="Illustrator"
                  placeholder={$t('common.form.illustrator')}
                  class={`input input-secondary join-item w-3/4 min-w-[180px] ${
                    errors?.get('Illustrator') ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={song.illustrator}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/illustrator', e.currentTarget.value);
                  }}
                />
              </label>
            </div>
            <div
              class={errors?.get('MinBpm') || errors?.get('Bpm') || errors?.get('MaxBpm')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('MinBpm') ?? errors?.get('Bpm') ?? errors?.get('MaxBpm') ?? ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('song.bpm')}
                </span>
                <div class="flex w-3/4">
                  <input
                    type="text"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="min_bpm"
                    name="MinBpm"
                    placeholder={$t('studio.submission.min_bpm')}
                    class={`input input-secondary join-item w-1/3 ${
                      errors?.get('MinBpm') ? 'input-error' : 'input-secondary'
                    }`}
                    bind:value={song.minBpm}
                    on:input={(e) => {
                      patch = applyPatch(
                        patch,
                        'replace',
                        '/minBpm',
                        parseFloat(e.currentTarget.value),
                      );
                    }}
                  />
                  <input
                    type="text"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="bpm"
                    name="Bpm"
                    placeholder={$t('studio.submission.main_bpm')}
                    class={`input input-secondary join-item w-1/3 ${
                      errors?.get('Bpm') ? 'input-error' : 'input-secondary'
                    }`}
                    bind:value={song.bpm}
                    on:input={(e) => {
                      patch = applyPatch(
                        patch,
                        'replace',
                        '/bpm',
                        parseFloat(e.currentTarget.value),
                      );
                    }}
                  />
                  <input
                    type="text"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="max_bpm"
                    name="MaxBpm"
                    placeholder={$t('studio.submission.max_bpm')}
                    class={`input input-secondary join-item w-1/3 ${
                      errors?.get('MaxBpm') ? 'input-error' : 'input-secondary'
                    }`}
                    bind:value={song.maxBpm}
                    on:input={(e) => {
                      patch = applyPatch(
                        patch,
                        'replace',
                        '/maxBpm',
                        parseFloat(e.currentTarget.value),
                      );
                    }}
                  />
                </div>
              </label>
            </div>
            <div
              class={errors?.get('Offset')
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={errors?.get('Offset')}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('song.offset')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="offset"
                  name="Offset"
                  placeholder={$t('studio.submission.offset_placeholder')}
                  class={`input input-secondary join-item w-3/4 min-w-[180px] ${
                    errors?.get('Offset') ? 'input-error' : 'input-secondary'
                  }`}
                  bind:value={song.offset}
                  on:input={(e) => {
                    patch = applyPatch(
                      patch,
                      'replace',
                      '/offset',
                      parseInt(e.currentTarget.value),
                    );
                  }}
                />
              </label>
            </div>
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
                  bind:value={song.description}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/description', e.currentTarget.value);
                  }}
                />
              </label>
              <button
                type="button"
                class="absolute right-2 bottom-2 btn btn-accent btn-outline btn-sm backdrop-blur"
                on:click={() => {
                  song.description = '';
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
  .noUi-target {
    --tw-border-opacity: 0.5;
    --tw-bg-opacity: 1;
    background: hsl(var(--b1) / var(--tw-bg-opacity));
    box-shadow: none;
    border-width: 1px;
    border-color: hsl(var(--bc) / var(--tw-border-opacity));
    border-radius: var(--rounded-badge, 1.9rem /* 30.4px */);
  }
</style>
