<script lang="ts">
  import { t } from '$lib/translations/config';
  import User from '$lib/components/User.svelte';
  import { superForm } from 'sveltekit-superforms/client';
  import { createQuery } from '@tanstack/svelte-query';
  import { richtext } from '$lib/richtext';
  import noUiSlider, { type API } from 'nouislider';
  import 'nouislider/dist/nouislider.css';
  import { convertTime, parseTime } from '$lib/utils';

  export let data;

  $: ({ user, api } = data);

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  interface TargetElement extends HTMLElement {
    noUiSlider?: API;
  }

  let audio: HTMLAudioElement | undefined;
  let illustration = false;
  let originalityProof = false;
  let slider: TargetElement;
  let isOriginal = false;
  let showPreview = 0;
  let previewStart = 0;
  let previewEnd = 0;
  let previewStatus = 0;
  let previewTimer: NodeJS.Timer;
  let previewTimeout: NodeJS.Timeout;
  let previewTime = 0;
  let authorName = '';
  let editionType = 0;
  let edition = '';
  let newComposerId: number | null = null;
  let newComposerDisplay = '';
  let queryComposer = false;

  $: composer = createQuery(
    api.user.info({ id: newComposerId ?? 0 }, { enabled: !!newComposerId && queryComposer }),
  );

  $: composerPreview = richtext(authorName ?? '');

  const handlePreview = () => {
    pausePreview();
    previewStatus = 0;
    const values = slider.noUiSlider?.get() as string[];
    previewStart = parseFloat(values[0]);
    previewEnd = parseFloat(values[1]);
    previewTime = previewStart;
  };

  const handleAudio = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      audio = new Audio(URL.createObjectURL(target.files[0]));
      showPreview = 1;
      audio.addEventListener('loadedmetadata', () => {
        if (!audio) return;
        showPreview = 2;
        audio.volume = 0.5;
        slider.noUiSlider?.destroy();
        noUiSlider.create(slider, {
          start: [0.2 * audio.duration, 0.8 * audio.duration],
          connect: true,
          range: {
            min: 0,
            max: audio.duration,
          },
        });
        handlePreview();
        slider.noUiSlider?.on('slide', handlePreview);
      });
    }
  };

  const handlePreviewPlay = () => {
    if (!audio) return;
    if (previewStatus == 0) {
      audio.currentTime = previewStart;
      previewTime = previewStart;
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
          audio.currentTime = previewStart;
          previewStatus = 0;
        },
        (previewEnd - previewTime) * 1e3,
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
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload_song')} | {$t('common.title')}</title>
</svelte:head>
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
            authorName += `[PZUser:${newComposerId}:${newComposerDisplay}:PZRT]`;
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
      <h1 class="text-4xl font-bold mb-6">{$t('studio.upload_song')}</h1>
      <div class="card w-full bg-base-100 shadow-lg">
        <div class="card-body">
          <form method="POST" class="w-full form-control" enctype="multipart/form-data" use:enhance>
            <div class="flex justify-start items-center my-2 w-full">
              <span class="w-32 place-self-center">{$t('song.original')}</span>
              <div class="flex w-1/3">
                <input
                  type="checkbox"
                  class="toggle toggle-secondary"
                  bind:checked={isOriginal}
                  on:change={() => {
                    if (isOriginal) {
                      if (editionType > 2) {
                        editionType = 0;
                      }
                      if (/\[PZUser:(\d+):(.+?):PZRT\]/gi.test(authorName)) {
                        authorName = '';
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
                  $errors.File
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:change={handleAudio}
              />
              {#if !!$errors.File}
                <span class="place-self-center w-2/3 text-error">{$errors.File}</span>
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
                  $errors.Illustration
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                on:input={(e) => {
                  if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                    illustration = true;
                  }
                }}
              />
              {#if !!$errors.Illustration}
                <span class="place-self-center w-2/3 text-error">{$errors.Illustration}</span>
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
                    $errors.OriginalityProof
                      ? 'input-error file:btn-error'
                      : 'input-secondary file:btn-outline file:bg-secondary'
                  }`}
                  on:input={(e) => {
                    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                      originalityProof = true;
                    }
                  }}
                />
                {#if !!$errors.OriginalityProof}
                  <span class="place-self-center w-2/3 text-error">{$errors.OriginalityProof}</span>
                {:else}
                  <span class="place-self-center w-2/3">
                    {$t('common.form.tips.originality_proof')}
                  </span>
                {/if}
              </div>
            {/if}
            {#if editionType === 3}
              <div class="flex">
                <span class="w-32 place-self-center">{$t('common.form.license')}</span>
                <input
                  type="file"
                  id="license"
                  name="License"
                  accept=".jpg, .jpeg, .png, .webp"
                  class={`mb-2 w-1/3 place-self-center file:mr-4 file:py-2 file:border-0 file:btn ${
                    $errors.License
                      ? 'input-error file:btn-error'
                      : 'input-secondary file:btn-outline file:bg-secondary'
                  }`}
                />
                {#if !!$errors.License}
                  <span class="place-self-center w-2/3 text-error">{$errors.License}</span>
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
                    <button
                      type="button"
                      class="btn btn-secondary btn-square btn-sm btn-outline"
                      on:click={handlePreviewPlay}
                    >
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        {#if previewStatus == 2}
                          <polygon points="5 3 10 3 10 21 5 21 5 3" />
                          <polygon points="14 3 19 3 19 21 14 21 14 3" />
                        {:else}
                          <polygon points="5 3 19 12 5 21 5 3" />
                        {/if}
                      </svg>
                    </button>
                  </div>
                  {#if !$errors.PreviewStart && !$errors.PreviewEnd && showPreview === 2}
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
                      value={convertTime(previewStart)}
                      on:input={(e) => {
                        if (!/^(\d{1,2}:)?\d{1,2}:\d{1,2}.\d+$/g.test(e.currentTarget.value))
                          return;
                        previewStart = parseTime(e.currentTarget.value);
                        if (
                          previewStart < 0 ||
                          previewStart > previewEnd ||
                          (audio && previewStart > audio.duration)
                        )
                          return;
                        pausePreview();
                        previewStatus = 0;
                        previewTime = previewStart;
                        slider.noUiSlider?.set([previewStart, previewEnd]);
                      }}
                    />
                  {/if}
                  <div class="slider place-self-center w-2/3" bind:this={slider} />
                  {#if !!$errors.PreviewStart || !!$errors.PreviewEnd}
                    <span class="place-self-center w-1/3 text-error">
                      {$errors.PreviewStart ?? $errors.PreviewEnd}
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
                      value={convertTime(previewEnd)}
                      on:input={(e) => {
                        if (!/^(\d{1,2}:)?\d{1,2}:\d{1,2}.\d+$/g.test(e.currentTarget.value))
                          return;
                        previewEnd = parseTime(e.currentTarget.value);
                        if (
                          previewEnd < 0 ||
                          previewStart > previewEnd ||
                          (audio && previewEnd > audio.duration)
                        )
                          return;
                        pausePreview();
                        previewStatus = 0;
                        slider.noUiSlider?.set([previewStart, previewEnd]);
                      }}
                    />
                  {/if}
                </div>
              </div>
            {/if}
            <div
              class={$errors.Title ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Title ? $errors.Title : ''}
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
                    $errors.Title ? 'input-error' : 'input-secondary'
                  }`}
                />
              </label>
            </div>
            <div
              class={$errors.EditionType || $errors.Edition
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.EditionType || $errors.Edition
                ? $errors.EditionType ?? $errors.Edition
                : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.song_edition')}
                </span>
                <select
                  id="edition_type"
                  name="EditionType"
                  class={`select select-secondary join-item ${
                    editionType === 0 ? 'w-3/4' : 'w-1/6'
                  } ${$errors.EditionType ? 'select-error' : 'select-secondary'}`}
                  bind:value={editionType}
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
                {#if editionType !== 0}
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
                      $errors.Edition ? 'input-error' : 'input-secondary'
                    }`}
                    bind:value={edition}
                  />
                {/if}
              </label>
            </div>
            {#if edition}
              <div class="flex my-2">
                <span class="w-1/4 place-self-center">
                  {$t('common.form.edition_preview')}
                </span>
                <div class="w-3/4">
                  <button
                    type="button"
                    class="btn btn-xs btn-neutral text-sm font-normal no-animation"
                  >
                    {$t(`song.edition_types.${editionType}`)}
                  </button>
                  {#if edition}
                    {edition}
                  {/if}
                </div>
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
                    {$t('common.accessibilities.0')} - {$t('song.accessibility_tips.0')}
                  </option>
                  {#if isOriginal || editionType === 3}
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
              class={$errors.AuthorName ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.AuthorName ? $errors.AuthorName : ''}
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
                  } min-w-[180px] ${$errors.AuthorName ? 'input-error' : 'input-secondary'}`}
                  bind:value={authorName}
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
            {#if isOriginal && authorName}
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
              class={$errors.Illustrator ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Illustrator ? $errors.Illustrator : ''}
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
                    $errors.Illustrator ? 'input-error' : 'input-secondary'
                  }`}
                />
              </label>
            </div>
            <div
              class={$errors.MinBpm || $errors.Bpm || $errors.MaxBpm
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.MinBpm ?? $errors.Bpm ?? $errors.MaxBpm ?? ''}
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
                      $errors.MinBpm ? 'input-error' : 'input-secondary'
                    }`}
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
                      $errors.Bpm ? 'input-error' : 'input-secondary'
                    }`}
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
                      $errors.MaxBpm ? 'input-error' : 'input-secondary'
                    }`}
                  />
                </div>
              </label>
            </div>
            <div
              class={$errors.Offset ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Offset ? $errors.Offset : ''}
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
                    $errors.Offset ? 'input-error' : 'input-secondary'
                  }`}
                />
              </label>
            </div>
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
                  disabled={$submitting ||
                    !audio ||
                    !illustration ||
                    (isOriginal && !originalityProof)}
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
