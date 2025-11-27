<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { onDestroy, onMount } from 'svelte';
  import RangeSlider from 'svelte-range-slider-pips';
  import { superForm } from 'sveltekit-superforms';

  import type { Bpm, ChartBundle, MilthmJson, RpeJson } from '$lib/types';

  import { page } from '$app/state';
  import Tag from '$lib/components/Tag.svelte';
  import User from '$lib/components/User.svelte';
  import { TAG_JOINER } from '$lib/constants';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { convertTime, parseTime } from '$lib/utils';

  interface Props {
    id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: any;
    chartBundle: ChartBundle;
    successCallback?: (id: string) => void;
  }

  let { id, form: formProp, chartBundle: bundle, successCallback }: Props = $props();
  let { user, api } = $derived(page.data);

  const { form, enhance, message, errors, submitting, allErrors } = superForm(formProp, {
    onResult({ result }) {
      if (result.type === 'success') {
        if (successCallback) successCallback(result.data?.id ?? '');
      }
    },
  });

  const toBeats = (time: number[]): number => {
    if (time[1] == 0 || time[2] == 0) return time[0];
    return time[0] + time[1] / time[2];
  };

  const findPredominantBpm = (bpmList: Bpm[], endTimeSec: number) => {
    const bpmDurations = new Map<number, number>();

    for (let i = 0; i < bpmList.length; i++) {
      const currentBpm = bpmList[i];
      const startTime = currentBpm.startTimeSec;
      const endTime = i + 1 < bpmList.length ? bpmList[i + 1].startTimeSec : endTimeSec;

      bpmDurations.set(
        currentBpm.bpm,
        (bpmDurations.get(currentBpm.bpm) || 0) + endTime - startTime,
      );
    }

    let predominantBpm = { bpm: 0, duration: 0 };
    for (const [bpm, duration] of bpmDurations) {
      if (
        duration > predominantBpm.duration ||
        (duration === predominantBpm.duration && bpm > predominantBpm.bpm)
      ) {
        predominantBpm = { bpm, duration };
      }
    }

    return predominantBpm.bpm;
  };

  onMount(async () => {
    handleAudio(URL.createObjectURL(bundle.resources.song));
  });

  onDestroy(() => {
    pausePreview();
  });

  $effect(() => {
    (async () => {
      const chartText = await bundle.resources.chart.text();
      const chartJson = JSON.parse(chartText);

      $form.Title = bundle.metadata.title;
      $form.Illustrator = bundle.metadata.illustrator ?? '';

      if ('META' in chartJson && 'BPMList' in chartJson) {
        const { BPMList, META } = chartJson as RpeJson;
        $form.Offset = META.offset;

        bpmList = BPMList;

        let lastBpm = 0;
        let lastBeat = 0;
        let lastTimeSec = 0;
        bpmList.forEach((bpm, i) => {
          bpm.startBeat = toBeats(bpm.startTime);
          bpm.startTimeSec =
            i === 0 ? lastTimeSec : lastTimeSec + ((bpm.startBeat - lastBeat) / lastBpm) * 60;
          lastBpm = bpm.bpm;
          lastBeat = bpm.startBeat;
          lastTimeSec = bpm.startTimeSec;
        });

        const bpmArr = bpmList.map((bpm) => bpm.bpm);
        $form.MinBpm = Math.min(...bpmArr);
        $form.MaxBpm = Math.max(...bpmArr);
        if ($form.MinBpm === $form.MaxBpm) {
          $form.Bpm = $form.MinBpm;
        }
      } else if ('lines' in chartJson && 'meta' in chartJson) {
        const { bpms, meta } = chartJson as MilthmJson;
        $form.Offset = Math.round(meta.offset * 100);

        bpmList = bpms.map((b) => ({
          bpm: b.bpm,
          startTime: b.time,
          startBeat: 0,
          startTimeSec: 0,
        }));

        let lastBpm = 0;
        let lastBeat = 0;
        let lastTimeSec = 0;
        bpmList.forEach((bpm, i) => {
          bpm.startBeat = toBeats(bpm.startTime);
          bpm.startTimeSec =
            i === 0 ? lastTimeSec : lastTimeSec + ((bpm.startBeat - lastBeat) / lastBpm) * 60;
          lastBpm = bpm.bpm;
          lastBeat = bpm.startBeat;
          lastTimeSec = bpm.startTimeSec;
        });

        const bpmArr = bpmList.map((bpm) => bpm.bpm);
        $form.MinBpm = Math.min(...bpmArr);
        $form.MaxBpm = Math.max(...bpmArr);
        if ($form.MinBpm === $form.MaxBpm) {
          $form.Bpm = $form.MinBpm;
        }
      }
    })();
  });

  $effect(() => {
    $form.Bpm = findPredominantBpm(bpmList, audioDuration);
  });

  const timePattern = /^(\d{1,2}:)?\d{1,2}:\d{1,2}.\d+$/;
  let audio: HTMLAudioElement | undefined = $state();
  let audioDuration = $state(60);
  let originalityProof = $state(false);
  let isOriginal = $state(false);
  let showPreview = $state(0);
  // NOTE: using previewRange instead of previewStart and previewEnd for RangeSlider bind
  let previewRange = $state([0, Infinity]);
  let previewStatus = $state(0);
  let previewTimer: NodeJS.Timeout;
  let previewTimeout: NodeJS.Timeout;
  let previewTime = $state(0);
  let authorName = $state(bundle.metadata.composer ?? '');
  let editionType = $state(0);
  let edition = $state('');
  let tagsRaw = $state('');
  let tags: string[] = [];
  let showTags = $state(true);
  let newTag = $state('');
  let newComposerId: number | null = $state(null);
  let newComposerDisplay = $state('');
  let queryComposer = $state(false);
  let bpmList = $state<Bpm[]>([]);

  let composer = $derived(
    createQuery(
      api.user.info({ id: newComposerId ?? 0 }, { enabled: !!newComposerId && queryComposer }),
    ),
  );
  let composerPreview = $derived(richtext(authorName ?? ''));
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

  const handleAudio = (src: string) => {
    pausePreview();
    audio = new Audio(src);
    showPreview = 1;
    audio.addEventListener('loadedmetadata', () => {
      if (!audio) return;
      showPreview = 2;
      audio.volume = 0.5;
      audioDuration = audio.duration;
      previewRange = [0.2 * audio.duration, 0.8 * audio.duration];
      handlePreview();
    });
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
</script>

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

<form
  method="POST"
  class="w-full form-control"
  enctype="multipart/form-data"
  action="?/song"
  use:enhance
>
  <input type="hidden" id="id" name="Id" value={id} />
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
              if (previewRange[0] < 0 || (audio && previewRange[0] > audio.duration)) return;
              if (previewRange[0] > previewRange[1]) {
                previewRange[1] = Math.min(previewRange[0] + 5, audio?.duration || Infinity);
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
              if (previewRange[1] < 0 || (audio && previewRange[1] > audio.duration)) return;
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
    class={$errors.Accessibility ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
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
        id="author_name"
        name="AuthorName"
        placeholder={$t('common.form.composer')}
        class={`input transition border-2 normal-border join-item ${
          isOriginal ? 'w-7/12' : 'w-9/12'
        } min-w-[180px] ${$errors.AuthorName ? 'hover:input-error' : 'hover:input-secondary'}`}
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
        bind:value={$form.Illustrator}
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
          type="number"
          step="any"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          id="min_bpm"
          name="MinBpm"
          value={$form.MinBpm}
          placeholder={$t('studio.submission.min_bpm')}
          class={`input transition border-2 normal-border join-item w-1/3 ${
            $errors.MinBpm ? 'hover:input-error' : 'hover:input-secondary'
          }`}
          oninput={(e) => {
            if (e.currentTarget.value === '') {
              $form.MinBpm = 0;
            } else {
              $form.MinBpm = parseFloat(e.currentTarget.value);
            }
          }}
        />
        <input
          type="number"
          step="any"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          id="bpm"
          name="Bpm"
          value={$form.Bpm}
          placeholder={$t('studio.submission.main_bpm')}
          class={`input transition border-2 normal-border join-item w-1/3 ${
            $errors.Bpm ? 'hover:input-error' : 'hover:input-secondary'
          }`}
          oninput={(e) => {
            if (e.currentTarget.value === '') {
              $form.Bpm = 0;
            } else {
              $form.Bpm = parseFloat(e.currentTarget.value);
            }
          }}
        />
        <input
          type="number"
          step="any"
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
            }
          }}
          id="max_bpm"
          name="MaxBpm"
          value={$form.MaxBpm}
          placeholder={$t('studio.submission.max_bpm')}
          class={`input transition border-2 normal-border join-item w-1/3 ${
            $errors.MaxBpm ? 'hover:input-error' : 'hover:input-secondary'
          }`}
          oninput={(e) => {
            if (e.currentTarget.value === '') {
              $form.MaxBpm = 0;
            } else {
              $form.MaxBpm = parseFloat(e.currentTarget.value);
            }
          }}
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
        value={$form.Offset}
        placeholder={$t('studio.submission.offset_placeholder')}
        class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
          $errors.Offset ? 'hover:input-error' : 'hover:input-secondary'
        }`}
        oninput={(e) => {
          if (e.currentTarget.value === '') {
            $form.Offset = 0;
          } else {
            $form.Offset = parseFloat(e.currentTarget.value);
          }
        }}
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
        disabled={$submitting || !audio || (isOriginal && !originalityProof)}
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
