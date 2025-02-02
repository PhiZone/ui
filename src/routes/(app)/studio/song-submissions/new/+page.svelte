<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import noUiSlider, { type API } from 'nouislider';
  import 'nouislider/dist/nouislider.css';
  import { onDestroy } from 'svelte';
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

  export let data;

  $: ({ user, api } = data);

  const { form, enhance, message, errors, submitting, allErrors } = superForm(data.form);

  interface TargetElement extends HTMLElement {
    noUiSlider?: API;
  }

  onDestroy(() => {
    pausePreview();
  });

  let audio: HTMLAudioElement | undefined;
  let illustration = false;
  // let illustrationFileSrc: string;
  // let illustrationOriginalSrc: string;
  // let illustrationCropping = false;
  let originalityProof = false;
  let slider: TargetElement;
  let isOriginal = false;
  let showPreview = 0;
  let previewStart = 0;
  let previewEnd = 0;
  let previewStatus = 0;
  let previewTimer: NodeJS.Timeout;
  let previewTimeout: NodeJS.Timeout;
  let previewTime = 0;
  let authorName = '';
  let editionType = 0;
  let edition = '';
  let tagsRaw = '';
  let tags: string[] = [];
  let showTags = true;
  let newTag = '';
  let newComposerId: number | null = null;
  let newComposerDisplay = '';
  let queryComposer = false;
  let querySongDuplications = false;
  let queryResourceRecords = false;

  $: composer = createQuery(
    api.user.info({ id: newComposerId ?? 0 }, { enabled: !!newComposerId && queryComposer }),
  );
  $: composerPreview = richtext(authorName ?? '');
  $: songDuplications = createQuery(
    api.song.listAll(
      {
        search: `${$form.Title} ${edition} ${authorName}`,
      },
      { enabled: querySongDuplications && !!$form.Title && !!authorName },
    ),
  );
  $: resourceRecords = createQuery(
    api.resourceRecord.listAll(
      {
        search: `${$form.Title} ${edition} ${authorName}`,
        rangeStrategy: [1, 2, 3, 4],
      },
      { enabled: queryResourceRecords && !!$form.Title && !!authorName },
    ),
  );
  $: existingTags = createQuery(
    api.tag.listAll(
      {
        rangeNormalizedName:
          tags.map((tag) => (tag ? tag.replace(/\s/g, '').toUpperCase() : '')) ?? undefined,
      },
      { enabled: !showTags && tags.length > 0 },
    ),
  );

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
    if (previewStatus === 0) {
      audio.currentTime = previewStart;
      previewTime = previewStart;
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
          on:input={() => {
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
          class="input transition border-2 normal-border hover:input-secondary join-item w-3/4"
          bind:value={newComposerDisplay}
        />
      </label>
      <div class="modal-action mt-3 px-4">
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <label
          for="studio-composer"
          class="btn border-2 normal-border btn-outline"
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
                on:change={handleAudio}
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
                on:input={() => {
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
                  on:input={(e) => {
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
                        class="btn border-2 normal-border hover:btn-secondary btn-square btn-sm btn-outline"
                        on:click|preventDefault={handlePreviewPlay}
                      >
                        <i class="fa-solid fa-pause fa-xl"></i>
                      </button>
                    {:else}
                      <button
                        type="button"
                        class="btn border-2 normal-border hover:btn-secondary btn-square btn-sm btn-outline"
                        on:click|preventDefault={handlePreviewPlay}
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
                  <div class="slider place-self-center w-2/3" bind:this={slider}></div>
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
                  {$t('song.title')}
                </span>
                <input
                  type="text"
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  on:input={() => {
                    querySongDuplications = false;
                    queryResourceRecords = false;
                  }}
                  on:focusout={() => {
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
                  on:input={() => {
                    querySongDuplications = false;
                    queryResourceRecords = false;
                  }}
                  on:focusout={() => {
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
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    on:input={() => {
                      querySongDuplications = false;
                      queryResourceRecords = false;
                    }}
                    on:focusout={() => {
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
                    on:click|preventDefault
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
                  on:keydown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                  on:input={() => {
                    querySongDuplications = false;
                    queryResourceRecords = false;
                  }}
                  on:focusout={() => {
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
                  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                  <label
                    for="studio-composer"
                    class="btn border-2 normal-border btn-outline hover:btn-secondary join-item w-1/6"
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
                    on:keydown={(e) => {
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
                    on:keydown={(e) => {
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
                    on:keydown={(e) => {
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
                  on:keydown={(e) => {
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
                  on:keyup
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
