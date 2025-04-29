<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { superForm } from 'sveltekit-superforms';

  import Tag from '$lib/components/Tag.svelte';
  import User from '$lib/components/User.svelte';
  import { LEVEL_TYPES, TAG_JOINER } from '$lib/constants';
  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { getLevelColor, getLevelDisplay } from '$lib/utils';
  import { page } from '$app/state';
  import type { ChartBundle } from '$lib/types';

  interface Props {
    id: string;
    form: any;
    chartBundle: ChartBundle;
    songId: string | null;
    songSubmissionId: string | null;
    successCallback?: () => void;
  }
  let {
    id,
    form: formProp,
    chartBundle: bundle,
    songId,
    songSubmissionId,
    successCallback,
  }: Props = $props();

  let { user, api } = $derived(page.data);

  const { enhance, message, errors, submitting, allErrors } = superForm(formProp, {
    onResult({ result }) {
      if (result.type === 'success') {
        if (successCallback) successCallback();
      }
    },
  });

  let fileInput = $state<HTMLInputElement | null>(null);
  let authorNameInput = $state<HTMLInputElement | null>(null);

  let isRanked = $state(false);
  let authorName = $state(bundle.metadata.charter ?? '');
  let levelType = $state(bundle.metadata.levelType);
  let level = $state(bundle.metadata.level ?? '');
  let difficulty = $state(bundle.metadata.difficulty?.toString() ?? '');
  let tagsRaw = $state('');
  let tags: string[] = [];
  let showTags = $state(true);
  let newTag = $state('');
  let newCharterId: number | null = $state(null);
  let newCharterDisplay = $state('');
  let queryCharter = $state(false);

  let charter = $derived(
    createQuery(
      api.user.info({ id: newCharterId ?? 0 }, { enabled: !!newCharterId && queryCharter }),
    ),
  );
  let charterPreview = $derived(richtext(authorName ?? ''));
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

  $effect(() => {
    if (
      $charter.isSuccess &&
      authorNameInput !== null &&
      authorNameInput.selectionStart !== null &&
      authorNameInput.selectionEnd !== null
    ) {
      newCharterDisplay = authorName.slice(
        authorNameInput.selectionStart,
        authorNameInput.selectionEnd,
      );
    }
  });
</script>

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
          oninput={() => {
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
          onclick={() => {
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
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <label
          for="studio-charter"
          class="btn border-2 normal-border btn-outline"
          onclick={() => {
            if (!authorNameInput) return;
            if (
              authorNameInput.selectionStart !== null &&
              authorNameInput.selectionEnd !== null &&
              authorNameInput.selectionEnd - authorNameInput.selectionStart > 0
            ) {
              authorNameInput.setRangeText(
                ` [PZUser:${newCharterId}:${newCharterDisplay}:PZRT]`,
                authorNameInput.selectionStart,
                authorNameInput.selectionEnd,
                'end',
              );
              authorName = authorNameInput.value;
            } else {
              authorName += ` [PZUser:${newCharterId}:${newCharterDisplay}:PZRT]`;
            }
            authorName = authorName.trim();
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
  action="?/chart"
  use:enhance
>
  <input type="hidden" id="id" name="Id" value={id} />
  <input type="hidden" id="song_id" name="SongId" value={songId} />
  <input type="hidden" id="song_submission_id" name="SongSubmissionId" value={songSubmissionId} />
  <input type="file" id="file" name="File" bind:this={fileInput} class="hidden" />
  <div class="flex justify-start items-center my-2 w-full">
    <span class="w-1/4 place-self-center">{$t('chart.is_ranked')}</span>
    <div class="w-3/4 flex items-center">
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
  </div>
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
    data-tip={$errors.LevelType || $errors.Level ? ($errors.LevelType ?? $errors.Level) : ''}
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
        onkeydown={(e) => {
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
        onkeydown={(e) => {
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
          class={`btn ${getLevelColor(levelType)} btn-sm text-xl cursor-default no-animation`}
          onclick={(e) => e.preventDefault()}
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
        onkeydown={(e) => {
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
        bind:this={authorNameInput}
      />
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <label
        for="studio-charter"
        class="btn border-2 normal-border btn-outline hover:btn-secondary join-item w-1/6"
        onclick={() => {
          newCharterId = null;
          newCharterDisplay = '';
        }}
        onkeyup={null}
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
        disabled={$submitting}
        onclick={() => {
          if (!fileInput) return;
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(bundle.resources.chart);
          fileInput.files = dataTransfer.files;
        }}
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
