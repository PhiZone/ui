<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { onDestroy } from 'svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import { superForm } from 'sveltekit-superforms';

  // import Cropper from '$lib/components/ImageCropper.svelte';
  import ResourceRecord from '$lib/components/ResourceRecord.svelte';
  import Song from '$lib/components/Song.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import User from '$lib/components/User.svelte';
  import { TAG_JOINER } from '$lib/constants';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, parseTime } from '$lib/utils';

  let { data } = $props();
  let { user, api } = $derived(data);

  const { form, enhance, message, errors, submitting, allErrors } = superForm(data.form);

  onDestroy(() => {
    pausePreview();
  });

  const timePattern = /^(\d{1,2}:)?\d{1,2}:\d{1,2}.\d+$/;
  let audio: HTMLAudioElement | undefined = $state();
  let audioDuration = $state(60);
  let illustration = $state(false);
  // let illustrationFileSrc: string;
  // let illustrationOriginalSrc: string;
  // let illustrationCropping = false;
  let originalityProof = $state(false);
  let isOriginal = $state(false);
  let showPreview = $state(0);
  // NOTE: using previewRange instead of previewStart and previewEnd for RangeSlider bind
  let previewRange = $state([0, Infinity]);
  let previewStatus = $state(0);
  let previewTimer: NodeJS.Timeout;
  let previewTimeout: NodeJS.Timeout;
  let previewTime = $state(0);
  let authorName = $state('');
  let editionType = $state(0);
  let edition = $state('');
  let tagsRaw = $state('');
  let tags: string[] = [];
  let showTags = $state(true);
  let newTag = $state('');
  let newComposerId: number | null = $state(null);
  let newComposerDisplay = $state('');
  let queryComposer = $state(false);
  let querySongDuplications = $state(false);
  let queryResourceRecords = $state(false);

  let composer = $derived(
    createQuery(
      api.user.info({ id: newComposerId ?? 0 }, { enabled: !!newComposerId && queryComposer }),
    ),
  );
  let composerPreview = $derived(richtext(authorName ?? ''));
  let songDuplications = $derived(
    createQuery(
      api.song.listAll(
        {
          search: `${$form.Title} ${edition} ${authorName}`,
        },
        { enabled: querySongDuplications && !!$form.Title && !!authorName },
      ),
    ),
  );
  let resourceRecords = $derived(
    createQuery(
      api.resourceRecord.listAll(
        {
          search: `${$form.Title} ${edition} ${authorName}`,
          rangeStrategy: [1, 2, 3, 4],
        },
        { enabled: queryResourceRecords && !!$form.Title && !!authorName },
      ),
    ),
  );
  let existingTags = $derived(
    createQuery(
      api.tag.listAll(
        {
          rangeNormalizedName:
            tags.map((tag) => (tag ? tag.replace(/\s/g, '').toUpperCase() : '')) ?? undefined,
        },
        { enabled: !showTags && tags.length > 0 },
      ),
    ),
  );

  const handlePreview = () => {
    pausePreview();
    previewStatus = 0;
    previewTime = previewRange[0];
  };

  const handleAudio = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    pausePreview();
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      audio = new Audio(URL.createObjectURL(target.files[0]));
      showPreview = 1;
      audio.addEventListener('loadedmetadata', () => {
        if (!audio) return;
        showPreview = 2;
        audio.volume = 0.5;
        audioDuration = audio.duration;
        previewRange = [0.2 * audio.duration, 0.8 * audio.duration];
        handlePreview();
      });
    }
  };

  const handlePreviewPlay = (e: Event) => {
    e.preventDefault();
    if (!audio) return;
    if (previewStatus === 0) {
      audio.currentTime = previewRange[0];
      previewTime = previewRange[0];
    }
    if (previewStatus === 2) {
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
          audio.currentTime = previewRange[0];
          previewStatus = 0;
        },
        (previewRange[1] - previewTime) * 1e3,
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

  const restartPreview = (e: Event) => {
    pausePreview();
    handlePreviewPlay(e);
  };

  // TODO The file list of an input field of type "file" in an HTML form is read-only
  // for security reasons. This means it cannot be set or modified programmatically.
  // Besides, data URLs don't work due to length limitations.

  // const handleIllustration = (
  //   e: Event & {
  //     currentTarget: EventTarget & HTMLInputElement;
  //   },
  // ) => {
  //   if (e.currentTarget.files && e.currentTarget.files.length > 0) {
  //     const illustration = e.currentTarget.files[0];
  //     const reader = new FileReader();
  //     reader.readAsDataURL(illustration);
  //     reader.onload = () => {
  //       illustrationOriginalSrc = reader.result as string;
  //       illustrationCropping = true;
  //     };
  //   }
  // };

  // const handleCropperResult = (e: CustomEvent<Blob>) => {
  //   const reader = new FileReader();
  //   reader.readAsDataURL(e.detail);
  //   reader.onload = () => {
  //     illustrationFileSrc = reader.result as string;
  //     console.log(e.detail);
  //     console.log(reader.result);
  //   };
  //   illustration = true;
  //   illustrationCropping = false;
  // };
</script>

<svelte:head>
  <title>{$t('common.studio')} - {$t('studio.upload_song')} | {$t('common.site_name')}</title>
</svelte:head>

<!-- {#if illustrationCropping}
  <Cropper
    bind:open={illustrationCropping}
    title={$t('common.image_cropper')}
    src={illustrationOriginalSrc}
    aspectRatio={16 / 9}
    on:submit={handleCropperResult}
  />
{/if} -->

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
      class="btn border-2 normal-border hover:btn-secondary btn-outline btn-sm btn-circle absolute right-2 top-2"
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
          class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
            $composer.isError ? 'hover:input-error' : 'hover:input-secondary'
          }`}
          bind:value={newComposerId}
          oninput={() => {
            queryComposer = false;
          }}
        />
        <button
          class={`btn border-2 normal-border join-item ${
            newComposerId || $composer.isLoading
              ? $composer.isError
                ? 'btn-error'
                : 'hover:btn-secondary btn-outline'
              : 'btn-disabled'
          }`}
          onclick={() => {
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
          class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
          bind:value={newComposerDisplay}
        />
      </label>
      <div class="modal-action mt-3 px-4">
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <label
          for="studio-composer"
          class="btn border-2 normal-border btn-outline"
          class:btn-disabled={!newComposerDisplay}
          onclick={() => {
            authorName += `[PZUser:${newComposerId}:${newComposerDisplay}:PZRT]`;
          }}
          onkeyup={null}
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
      <h1 class="text-4xl font-bold mb-6">{$t('studio.upload_song')}</h1>
      <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
        <div class="card-body">
          <form method="POST" class="w-full form-control" enctype="multipart/form-data" use:enhance>
            <div class="flex justify-start items-center my-2 w-full">
              <span class="w-32">{$t('song.original')}</span>
              <div class="flex w-1/3">
                <input
                  type="checkbox"
                  class="toggle border-2 toggle-secondary"
                  bind:checked={isOriginal}
                  onchange={() => {
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
              <span class="w-2/3">
                {$t(`common.form.tips.${isOriginal ? 'original' : 'reposted'}`)}
              </span>
            </div>
            <div class="flex items-center my-2">
              <span class="w-32">{$t('common.form.audio')}</span>
              <input
                type="file"
                id="file"
                name="File"
                accept=".mp3, .wav, .flac, .ogg"
                class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                  $errors.File
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                onchange={handleAudio}
              />
              {#if !!$errors.File}
                <span class="w-2/3 text-error">{$errors.File}</span>
              {:else}
                <span class="w-2/3">{$t('common.form.tips.audio')}</span>
              {/if}
            </div>
            <div class="flex items-center my-2">
              <span class="w-32">{$t('common.form.illustration')}</span>
              <input
                type="file"
                id="illustration"
                name="Illustration"
                accept=".jpg, .jpeg, .png, .webp"
                class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                  $errors.Illustration
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
                oninput={() => {
                  illustration = true;
                }}
              />
              {#if !!$errors.Illustration}
                <span class="w-2/3 text-error">{$errors.Illustration}</span>
              {:else}
                <span class="w-2/3">{$t('common.form.tips.illustration')}</span>
              {/if}
            </div>
            {#if isOriginal}
              <div class="flex items-center my-2">
                <span class="w-32">
                  {$t('common.form.originality_proof')}
                </span>
                <input
                  type="file"
                  id="originality_proof"
                  name="OriginalityProof"
                  accept=".zip"
                  class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                    $errors.OriginalityProof
                      ? 'input-error file:btn-error'
                      : 'input-secondary file:btn-outline file:bg-secondary'
                  }`}
                  oninput={(e) => {
                    if (e.currentTarget.files && e.currentTarget.files.length > 0) {
                      originalityProof = true;
                    }
                  }}
                />
                {#if !!$errors.OriginalityProof}
                  <span class="w-2/3 text-error">{$errors.OriginalityProof}</span>
                {:else}
                  <span class="w-2/3">
                    {$t('common.form.tips.originality_proof')}
                  </span>
                {/if}
              </div>
            {/if}
            {#if editionType === 3}
              <div class="flex items-center my-2">
                <span class="w-32">{$t('common.form.license')}</span>
                <input
                  type="file"
                  id="license"
                  name="License"
                  accept=".jpg, .jpeg, .png, .webp"
                  class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                    $errors.License
                      ? 'input-error file:btn-error'
                      : 'input-secondary file:btn-outline file:bg-secondary'
                  }`}
                />
                {#if !!$errors.License}
                  <span class="w-2/3 text-error">{$errors.License}</span>
                {:else}
                  <span class="w-2/3">{$t('common.form.tips.license')}</span>
                {/if}
              </div>
            {/if}
            {#if showPreview}
              <div class="flex my-2">
                <span class="w-32 place-self-center">{$t('common.form.song_preview')}</span>
                <div class="flex w-full gap-2">
                  <div class="tooltip place-self-center" data-tip={convertTime(previewTime)}>
                    {#if previewStatus === 2}
                      <button
                        type="button"
                        aria-label={$t('song.pause')}
                        class="btn border-2 normal-border hover:btn-secondary btn-square btn-sm btn-outline"
                        onclick={handlePreviewPlay}
                      >
                        <i class="fa-solid fa-pause fa-xl"></i>
                      </button>
                    {:else}
                      <button
                        type="button"
                        aria-label={$t('song.play')}
                        class="btn border-2 normal-border hover:btn-secondary btn-square btn-sm btn-outline"
                        onclick={handlePreviewPlay}
                      >
                        <i class="fa-solid fa-play fa-lg"></i>
                      </button>
                    {/if}
                  </div>
                  {#if !$errors.PreviewStart && !$errors.PreviewEnd && showPreview === 2}
                    <input
                      type="text"
                      id="preview_start"
                      name="PreviewStart"
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder={$t('studio.submission.start')}
                      class="input w-1/6 text-right border-2 transition hover:input-secondary"
                      value={convertTime(previewRange[0])}
                      onblur={(e) => {
                        // discard changes if the input is invalid
                        if (!timePattern.test(e.currentTarget.value)) {
                          e.currentTarget.value = convertTime(previewRange[0]);
                          return;
                        }
                        previewRange[0] = parseTime(e.currentTarget.value);
                        if (previewRange[0] < 0 || (audio && previewRange[0] > audio.duration))
                          return;
                        if (previewRange[0] > previewRange[1]) {
                          previewRange[1] = Math.min(
                            previewRange[0] + 5,
                            audio?.duration || Infinity,
                          );
                        }

                        previewStatus = 0;
                        previewTime = previewRange[0];
                        restartPreview(e);
                      }}
                    />
                  {/if}
                  <div class="place-self-center w-2/3 daisy-ui">
                    <!-- TODO: display audio.currentTime in slider -->
                    <RangeSlider
                      id="preview-slider"
                      min={0}
                      max={audioDuration}
                      bind:values={previewRange}
                      on:change={handlePreview}
                      on:stop={restartPreview}
                      pips
                      step={0.01}
                      pipstep={(audioDuration < 60 ? 5 : audioDuration < 600 ? 30 : 300) / 0.01}
                      formatter={(value) => convertTime(value, true)}
                      range
                      pushy
                      all="label"
                    />
                  </div>
                  {#if !!$errors.PreviewStart || !!$errors.PreviewEnd}
                    <span class="place-self-center w-1/3 text-error">
                      {$errors.PreviewStart ?? $errors.PreviewEnd}
                    </span>
                  {:else if showPreview === 2}
                    <input
                      type="text"
                      id="preview_end"
                      name="PreviewEnd"
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.currentTarget.blur();
                          e.preventDefault();
                        }
                      }}
                      placeholder={$t('studio.submission.end')}
                      class="input w-1/6 text-left border-2 transition hover:input-secondary"
                      value={convertTime(previewRange[1])}
                      onblur={(e) => {
                        // discard changes if the input is invalid
                        if (!timePattern.test(e.currentTarget.value)) {
                          e.currentTarget.value = convertTime(previewRange[1]);
                          return;
                        }
                        previewRange[1] = parseTime(e.currentTarget.value);
                        if (previewRange[1] < 0 || (audio && previewRange[1] > audio.duration))
                          return;
                        if (previewRange[0] > previewRange[1]) {
                          previewRange[0] = Math.max(previewRange[1] - 5, 0);
                        }
                        previewStatus = 0;
                        restartPreview(e);
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
                  {$t('song.title')}
                </span>
                <input
                  type="text"
                  onkeydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  oninput={() => {
                    querySongDuplications = false;
                    queryResourceRecords = false;
                  }}
                  onfocusout={() => {
                    querySongDuplications = true;
                    queryResourceRecords = true;
                  }}
                  id="title"
                  name="Title"
                  bind:value={$form.Title}
                  placeholder={$t('song.title')}
                  class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                    $errors.Title ? 'hover:input-error' : 'hover:input-secondary'
                  }`}
                />
              </label>
            </div>
            <div
              class={$errors.EditionType || $errors.Edition
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.EditionType || $errors.Edition
                ? ($errors.EditionType ?? $errors.Edition)
                : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.form.song_edition')}
                </span>
                <select
                  id="edition_type"
                  name="EditionType"
                  class={`select transition border-2 normal-border join-item ${
                    editionType === 0 ? 'w-3/4' : 'w-1/6'
                  } ${$errors.EditionType ? 'hover:select-error' : 'hover:select-secondary'}`}
                  bind:value={editionType}
                  oninput={() => {
                    querySongDuplications = false;
                    queryResourceRecords = false;
                  }}
                  onfocusout={() => {
                    querySongDuplications = true;
                    queryResourceRecords = true;
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
                {#if editionType !== 0}
                  <input
                    type="text"
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    oninput={() => {
                      querySongDuplications = false;
                      queryResourceRecords = false;
                    }}
                    onfocusout={() => {
                      querySongDuplications = true;
                      queryResourceRecords = true;
                    }}
                    id="edition"
                    name="Edition"
                    placeholder={$t('studio.submission.edition_placeholder')}
                    class={`input transition border-2 normal-border join-item w-7/12 min-w-[180px] ${
                      $errors.Edition ? 'hover:input-error' : 'hover:input-secondary'
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
                    class="btn btn-xs btn-shallow text-sm font-normal cursor-default no-animation"
                    onclick={(e) => e.preventDefault()}
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
                  class={`select transition border-2 normal-border join-item w-3/4 ${
                    $errors.Accessibility ? 'hover:select-error' : 'hover:select-secondary'
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
                  onkeydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  oninput={() => {
                    querySongDuplications = false;
                    queryResourceRecords = false;
                  }}
                  onfocusout={() => {
                    querySongDuplications = true;
                    queryResourceRecords = true;
                  }}
                  id="author_name"
                  name="AuthorName"
                  placeholder={$t('common.form.composer')}
                  class={`input transition border-2 normal-border join-item ${
                    isOriginal ? 'w-7/12' : 'w-9/12'
                  } min-w-[180px] ${
                    $errors.AuthorName ? 'hover:input-error' : 'hover:input-secondary'
                  }`}
                  bind:value={authorName}
                />
                {#if isOriginal}
                  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                  <label
                    for="studio-composer"
                    class="btn border-2 normal-border btn-outline hover:btn-secondary join-item w-1/6"
                    onclick={() => {
                      newComposerId = null;
                      newComposerDisplay = '';
                    }}
                    onkeyup={null}
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
                  onkeydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="illustrator"
                  name="Illustrator"
                  placeholder={$t('common.form.illustrator')}
                  class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                    $errors.Illustrator ? 'hover:input-error' : 'hover:input-secondary'
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
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="min_bpm"
                    name="MinBpm"
                    placeholder={$t('studio.submission.min_bpm')}
                    class={`input transition border-2 normal-border join-item w-1/3 ${
                      $errors.MinBpm ? 'hover:input-error' : 'hover:input-secondary'
                    }`}
                  />
                  <input
                    type="text"
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="bpm"
                    name="Bpm"
                    placeholder={$t('studio.submission.main_bpm')}
                    class={`input transition border-2 normal-border join-item w-1/3 ${
                      $errors.Bpm ? 'hover:input-error' : 'hover:input-secondary'
                    }`}
                  />
                  <input
                    type="text"
                    onkeydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    id="max_bpm"
                    name="MaxBpm"
                    placeholder={$t('studio.submission.max_bpm')}
                    class={`input transition border-2 normal-border join-item w-1/3 ${
                      $errors.MaxBpm ? 'hover:input-error' : 'hover:input-secondary'
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
                  onkeydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  id="offset"
                  name="Offset"
                  placeholder={$t('studio.submission.offset_placeholder')}
                  class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
                    $errors.Offset ? 'hover:input-error' : 'hover:input-secondary'
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
                  class={`textarea transition border-2 normal-border join-item ${
                    $errors.Description ? 'hover:textarea-error' : 'hover:textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={`${$t('common.description')}${$t('common.optional')}`}
                ></textarea>
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
                  onkeydown={(e) => {
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
                  aria-label={$t('common.add')}
                  onclick={(e) => {
                    e.preventDefault();
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
                    <Tag {tag} full target="_blank" />
                  {/each}
                </div>
              </div>
            {/if}
            {#if $songDuplications.isSuccess && $songDuplications.data.data.length > 0}
              <div class="flex my-2">
                <div class="w-1/4 flex flex-col gap-2">
                  <h2 class="text-lg font-bold">{$t('studio.submission.duplicate_song')}</h2>
                  <p class="text-base">{$t('studio.submission.duplicate_song_description')}</p>
                </div>
                <div class="w-3/4 result">
                  {#each $songDuplications.data.data as song}
                    <Song {song} />
                  {/each}
                </div>
              </div>
            {/if}
            {#if $resourceRecords.isSuccess && $resourceRecords.data.data.length > 0}
              <div class="flex my-2">
                <div class="w-1/4 flex flex-col gap-2">
                  <h2 class="text-lg font-bold">{$t('studio.submission.copyright_alert')}</h2>
                  <p class="text-base">{$t('studio.submission.copyright_alert_description')}</p>
                </div>
                <div class="w-3/4 result">
                  {#each $resourceRecords.data.data as resourceRecord}
                    <ResourceRecord {resourceRecord} />
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
  :global #preview-slider {
    .pip .pipVal {
      display: none;
    }
    .pip:nth-of-type(odd) {
      width: 1.5px;
    }
    .pip:nth-of-type(1) .pipVal,
    .pip:nth-last-of-type(1) .pipVal {
      display: inline-flex;
    }
    @screen sm {
      .pip:nth-of-type(4n + 1) .pipVal {
        display: inline-flex;
      }
    }
    @screen lg {
      .pip:nth-of-type(odd) .pipVal {
        display: inline-flex;
      }
    }
    .pip:nth-last-of-type(2) .pipVal {
      display: none;
    }
  }
</style>
