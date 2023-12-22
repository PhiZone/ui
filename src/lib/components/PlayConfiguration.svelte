<script lang="ts">
  import { goto, invalidateAll } from '$app/navigation';
  import { page } from '$app/stores';
  import type { PlayConfigurationDto } from '$lib/api/playConfiguration';
  import type { PatchElement } from '$lib/api/types';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { applyPatch, parseDateTime } from '$lib/utils';
  import Delete from './Delete.svelte';
  import UpdateSuccess from './UpdateSuccess.svelte';

  $: ({ user, api, preferredPlayConfiguration } = $page.data);

  export let playConfiguration: PlayConfigurationDto;
  export let fixedHeight = true;

  const minJudgment = 5;

  let patch = new Array<PatchElement>();
  let status = Status.WAITING;
  let errorCode = '';
  let updateErrors: Map<string, string> | undefined = undefined;
  let aspectRatio1 = playConfiguration.aspectRatio ? playConfiguration.aspectRatio[0] : 16;
  let aspectRatio2 = playConfiguration.aspectRatio ? playConfiguration.aspectRatio[1] : 9;

  $: badJudgment = playConfiguration.goodJudgment * 1.125;
  $: rksFactor = calculateRksFactor(
    playConfiguration.perfectJudgment,
    playConfiguration.goodJudgment,
  );

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    updateErrors = undefined;
    const resp = await api.playConfiguration.update({ id: playConfiguration.id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      updateErrors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(`\x1b[2m${new Date().toLocaleTimeString()}\x1b[0m`, updateErrors);
    }
  };

  const calculateRksFactor = (perfectJudgment: number, goodJudgment: number) => {
    var x = 0.8 * perfectJudgment + 0.225 * goodJudgment;

    if (x > 150) {
      return 0;
    } else if (x > 100) {
      return (x * x) / 7500 - (4 * x) / 75 + 5;
    } else {
      x -= 100;
      return -((x * x * x) / 4e6) + 1;
    }
  };

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
</script>

<UpdateSuccess
  id="update-success-{playConfiguration.id}"
  checked={status === Status.OK}
  onClick={() => (status = Status.WAITING)}
/>

<input
  type="checkbox"
  id="play-configuration-update-{playConfiguration.id}"
  class="modal-toggle"
  checked={status === Status.SENDING || status === Status.ERROR}
/>
<div class="modal" role="dialog">
  <div class="modal-box min-w-[30vw] overflow-hidden">
    <label
      for="play-configuration-update-{playConfiguration.id}"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('play_configuration.play_configuration')}</h3>
    <form
      class="w-full form-control gap-4"
      on:submit={(e) => {
        e.preventDefault();
      }}
    >
      <div class="flex w-full pt-6">
        <div
          class="tooltip {playConfiguration.perfectJudgment < 45
            ? 'tooltip-right'
            : ''} tooltip-warning leading-[0px] h-[7.5px]"
          data-tip="{$t('play_configuration.perfect')} ({playConfiguration.perfectJudgment}ms)"
          style:width="{playConfiguration.perfectJudgment / 3.5}%"
        >
          <progress value="1" max="1" class="progress progress-warning" />
        </div>
        <div
          class="tooltip {playConfiguration.goodJudgment < 40
            ? 'tooltip-right'
            : ''} tooltip-info leading-[0px] h-[7.5px]"
          data-tip="{$t('play_configuration.good')} ({playConfiguration.goodJudgment}ms)"
          style:width="{(playConfiguration.goodJudgment - playConfiguration.perfectJudgment) /
            3.5}%"
        >
          <progress value="1" max="1" class="progress progress-info" />
        </div>
        <div
          class="tooltip {playConfiguration.goodJudgment < 25
            ? 'tooltip-right'
            : ''} tooltip-error leading-[0px] h-[7.5px]"
          data-tip="{$t('play_configuration.bad')} ({badJudgment}ms)"
          style:width="{(badJudgment - playConfiguration.goodJudgment) / 3.5}%"
        >
          <progress value="1" max="1" class="progress progress-error" />
        </div>
        <div
          class="tooltip {playConfiguration.goodJudgment > 225
            ? 'tooltip-left'
            : ''} leading-[0px] h-[7.5px]"
          data-tip={$t('play_configuration.miss_or_incoming')}
          style:width="{100 - badJudgment / 3.5}%"
        >
          <progress value="0" max="1" class="progress" />
        </div>
      </div>
      <div class="form-control">
        <div
          class={updateErrors?.get('perfectJudgment')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('perfectJudgment') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.perfect')} (ms)</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="perfect_judgment"
              name="perfectJudgment"
              min={minJudgment}
              max="150"
              bind:value={playConfiguration.perfectJudgment}
              class={`range join-item w-7/12 ${
                updateErrors?.get('perfectJudgment') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const perfectJudgment = parseInt(e.currentTarget.value);
                if (
                  playConfiguration.goodJudgment <
                  Math.max(perfectJudgment + minJudgment, perfectJudgment * 1.125)
                ) {
                  playConfiguration.goodJudgment = Math.round(
                    Math.max(perfectJudgment + minJudgment, perfectJudgment * 1.125),
                  );
                }
                patch = applyPatch(patch, 'replace', '/perfectJudgment', perfectJudgment);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.perfectJudgment}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.perfectJudgment}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < minJudgment) {
                  e.currentTarget.value = `${minJudgment}`;
                } else if (parseInt(e.currentTarget.value) > 150) {
                  e.currentTarget.value = '150';
                }
                playConfiguration.perfectJudgment = parseInt(e.currentTarget.value);
                if (
                  playConfiguration.goodJudgment <
                  Math.max(
                    playConfiguration.perfectJudgment + minJudgment,
                    playConfiguration.perfectJudgment * 1.125,
                  )
                ) {
                  playConfiguration.goodJudgment = Math.round(
                    Math.max(
                      playConfiguration.perfectJudgment + minJudgment,
                      playConfiguration.perfectJudgment * 1.125,
                    ),
                  );
                }
                patch = applyPatch(
                  patch,
                  'replace',
                  '/perfectJudgment',
                  playConfiguration.perfectJudgment,
                );
              }}
            />
          </div>
        </div>
        <div
          class={updateErrors?.get('goodJudgment')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('goodJudgment') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.good')} (ms)</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="good_judgment"
              name="goodJudgment"
              min={Math.round(
                Math.max(
                  playConfiguration.perfectJudgment + minJudgment,
                  playConfiguration.perfectJudgment * 1.125,
                ),
              )}
              max="300"
              bind:value={playConfiguration.goodJudgment}
              class={`range join-item w-7/12 ${
                updateErrors?.get('goodJudgment') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const goodJudgment = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/goodJudgment', goodJudgment);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.goodJudgment}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${Math.round(playConfiguration.goodJudgment)}`;
                  return;
                }
                if (
                  parseInt(e.currentTarget.value) <
                  Math.max(
                    playConfiguration.perfectJudgment + minJudgment,
                    playConfiguration.perfectJudgment * 1.125,
                  )
                ) {
                  e.currentTarget.value = `${Math.round(
                    Math.max(
                      playConfiguration.perfectJudgment + minJudgment,
                      playConfiguration.perfectJudgment * 1.125,
                    ),
                  )}`;
                } else if (parseInt(e.currentTarget.value) > 300) {
                  e.currentTarget.value = '300';
                }
                playConfiguration.goodJudgment = parseInt(e.currentTarget.value);
                patch = applyPatch(
                  patch,
                  'replace',
                  '/goodJudgment',
                  playConfiguration.goodJudgment,
                );
              }}
            />
          </div>
        </div>
        <div class="flex items-center h-[45px]">
          <span class="w-1/4">{$t('play_configuration.bad')} (ms)</span>
          <span class="w-1/4">{badJudgment}</span>
          <span class="w-1/4">{$t('play_configuration.rks_factor')}</span>
          <span class="w-1/4">{rksFactor.toFixed(4)}</span>
        </div>
        <div class="flex items-center h-[45px]">
          <div
            class={updateErrors?.get('simultaneousNoteHint')
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-1/2'
              : 'w-1/2'}
            data-tip={updateErrors?.get('simultaneousNoteHint') ?? ''}
          >
            <div class="flex items-center">
              <span class="w-1/2">{$t('play_configuration.simultaneous_note_hint')}</span>
              <input
                type="checkbox"
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                id="simultaneous_note_hint"
                name="simultaneousNoteHint"
                bind:checked={playConfiguration.simultaneousNoteHint}
                class={`toggle border-2 transition ${
                  updateErrors?.get('simultaneousNoteHint') ? 'toggle-error' : ''
                }`}
                on:input={() => {
                  patch = applyPatch(
                    patch,
                    'replace',
                    '/simultaneousNoteHint',
                    !playConfiguration.simultaneousNoteHint,
                  );
                }}
              />
            </div>
          </div>
          <div
            class={updateErrors?.get('fcApIndicator')
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-1/2'
              : 'w-1/2'}
            data-tip={updateErrors?.get('fcApIndicator') ?? ''}
          >
            <div class="flex items-center">
              <span class="w-1/2">{$t('play_configuration.fc_ap_indicator')}</span>
              <input
                type="checkbox"
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                id="fc_ap_indicator"
                name="fcApIndicator"
                bind:checked={playConfiguration.fcApIndicator}
                class={`toggle border-2 transition ${
                  updateErrors?.get('fcApIndicator') ? 'toggle-error' : ''
                }`}
                on:input={() => {
                  patch = applyPatch(
                    patch,
                    'replace',
                    '/fcApIndicator',
                    !playConfiguration.fcApIndicator,
                  );
                }}
              />
            </div>
          </div>
        </div>
        <div
          class={updateErrors?.get('noteSize')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('noteSize') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.note_size')}</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="note_size"
              name="noteSize"
              min="0.4"
              max="2"
              step="0.1"
              bind:value={playConfiguration.noteSize}
              class={`range join-item w-7/12 ${updateErrors?.get('noteSize') ? 'range-error' : ''}`}
              on:input={(e) => {
                const noteSize = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/noteSize', noteSize);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.noteSize}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?([0-9]*[.])?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.noteSize}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                playConfiguration.noteSize = parseFloat(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/noteSize', playConfiguration.noteSize);
              }}
            />
          </div>
        </div>
        <div
          class={updateErrors?.get('backgroundLuminance')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('backgroundLuminance') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.background_luminance')} (%)</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="background_luminance"
              name="backgroundLuminance"
              min="0"
              max="100"
              bind:value={playConfiguration.backgroundLuminance}
              class={`range join-item w-7/12 ${
                updateErrors?.get('backgroundLuminance') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const backgroundLuminance = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/backgroundLuminance', backgroundLuminance);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.backgroundLuminance}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.backgroundLuminance}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                playConfiguration.backgroundLuminance = parseInt(e.currentTarget.value);
                patch = applyPatch(
                  patch,
                  'replace',
                  '/backgroundLuminance',
                  playConfiguration.backgroundLuminance,
                );
              }}
            />
          </div>
        </div>
        <div
          class={updateErrors?.get('backgroundBlur')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('backgroundBlur') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.background_blur')}</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="background_blur"
              name="backgroundBlur"
              min="0"
              max="2"
              step="0.1"
              bind:value={playConfiguration.backgroundBlur}
              class={`range join-item w-7/12 ${
                updateErrors?.get('backgroundBlur') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const backgroundBlur = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/backgroundBlur', backgroundBlur);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.backgroundBlur}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?([0-9]*[.])?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.backgroundBlur}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                playConfiguration.backgroundBlur = parseFloat(e.currentTarget.value);
                patch = applyPatch(
                  patch,
                  'replace',
                  '/backgroundBlur',
                  playConfiguration.backgroundBlur,
                );
              }}
            />
          </div>
        </div>
        <div
          class={updateErrors?.get('chartOffset')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('chartOffset') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.chart_offset')} (ms)</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="chart_offset"
              name="chartOffset"
              min="-600"
              max="600"
              bind:value={playConfiguration.chartOffset}
              class={`range join-item w-7/12 ${
                updateErrors?.get('chartOffset') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const chartOffset = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/chartOffset', chartOffset);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.chartOffset}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.chartOffset}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                playConfiguration.chartOffset = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/chartOffset', playConfiguration.chartOffset);
              }}
            />
          </div>
        </div>
        <div
          class={updateErrors?.get('hitSoundVolume')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('hitSoundVolume') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.hit_sound_volume')} (%)</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="hit_sound_volume"
              name="hitSoundVolume"
              min="0"
              max="100"
              bind:value={playConfiguration.hitSoundVolume}
              class={`range join-item w-7/12 ${
                updateErrors?.get('hitSoundVolume') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const hitSoundVolume = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/hitSoundVolume', hitSoundVolume);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.hitSoundVolume}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.hitSoundVolume}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                playConfiguration.hitSoundVolume = parseInt(e.currentTarget.value);
                patch = applyPatch(
                  patch,
                  'replace',
                  '/hitSoundVolume',
                  playConfiguration.hitSoundVolume,
                );
              }}
            />
          </div>
        </div>
        <div
          class={updateErrors?.get('musicVolume')
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={updateErrors?.get('musicVolume') ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.music_volume')} (%)</span>
            <input
              type="range"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="music_volume"
              name="musicVolume"
              min="0"
              max="100"
              bind:value={playConfiguration.musicVolume}
              class={`range join-item w-7/12 ${
                updateErrors?.get('musicVolume') ? 'range-error' : ''
              }`}
              on:input={(e) => {
                const musicVolume = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/musicVolume', musicVolume);
              }}
            />
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={playConfiguration.musicVolume}
              class="input w-1/6 text-right text-xl font-bold"
              on:focusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${playConfiguration.musicVolume}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                playConfiguration.musicVolume = parseInt(e.currentTarget.value);
                patch = applyPatch(patch, 'replace', '/musicVolume', playConfiguration.musicVolume);
              }}
            />
          </div>
        </div>
      </div>
      <div
        class={updateErrors?.get('name')
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error relative'
          : 'relative'}
        data-tip={updateErrors?.get('name') ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('play_configuration.name')}
          </span>
          <input
            type="text"
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="name"
            name="name"
            bind:value={playConfiguration.name}
            placeholder={`${$t('play_configuration.name')}${$t('common.optional')}`}
            class={`input transition border-2 normal-border join-item w-3/4 ${
              updateErrors?.get('name') ? 'hover:input-error' : 'hover:input-secondary'
            }`}
            on:input={(e) => {
              patch = applyPatch(patch, 'replace', '/name', e.currentTarget.value);
            }}
          />
        </label>
        <button
          type="button"
          class="absolute right-2 top-[7.5px] btn btn-sm {playConfiguration.name
            ? 'border-2 hover:btn-outline backdrop-blur'
            : 'btn-disabled'}"
          on:click={() => {
            playConfiguration.name = null;
          }}
        >
          {$t('common.empty_v')}
        </button>
      </div>
      <div
        class={updateErrors?.get('chartMirroring')
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
          : ''}
        data-tip={updateErrors?.get('chartMirroring') ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('play_configuration.chart_mirroring')}
          </span>
          <select
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="chart_mirroring"
            name="chartMirroring"
            bind:value={playConfiguration.chartMirroring}
            class={`select transition border-2 normal-border join-item w-3/4 ${
              updateErrors?.get('chartMirroring') ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            on:input={(e) => {
              const chartMirroring = parseInt(e.currentTarget.value);
              patch = applyPatch(patch, 'replace', '/chartMirroring', chartMirroring);
            }}
          >
            {#each [0, 1, 2, 3] as value}
              <option {value}>{$t(`play_configuration.chart_mirroring_modes.${value}`)}</option>
            {/each}
          </select>
        </label>
      </div>
      <div
        class={updateErrors?.get('aspectRatio1') || updateErrors?.get('aspectRatio2')
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
          : ''}
        data-tip={updateErrors?.get('aspectRatio1') ?? updateErrors?.get('aspectRatio2') ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('play_configuration.aspect_ratio')}
          </span>
          <select
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="aspect_ratio_1"
            name="aspectRatio1"
            bind:value={aspectRatio1}
            class={`select transition border-2 normal-border join-item w-[37.5%] ${
              updateErrors?.get('aspectRatio1') ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            on:input={(e) => {
              const aspectRatio1 = parseInt(e.currentTarget.value);
              patch = applyPatch(patch, 'replace', '/aspectRatio/0', aspectRatio1);
            }}
          >
            <option value={0}>{$t('common.auto')}</option>
            {#each Array.from({ length: 30 }, (_, index) => index + 1) as value}
              <option {value}>{value}</option>
            {/each}
          </select>
          <select
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="aspect_ratio_2"
            name="aspectRatio2"
            bind:value={aspectRatio2}
            class={`select transition border-2 normal-border join-item w-[37.5%] ${
              updateErrors?.get('aspectRatio2') ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            on:input={(e) => {
              const aspectRatio2 = parseInt(e.currentTarget.value);
              patch = applyPatch(patch, 'replace', '/aspectRatio/1', aspectRatio2);
            }}
          >
            {#if aspectRatio1 > 0}
              {#each Array.from({ length: aspectRatio1 }, (_, index) => index + 1).filter((number) => gcd(number, aspectRatio1) === 1) as value}
                <option {value}>{value}</option>
              {/each}
            {:else}
              <option value={0}>{$t('common.auto')}</option>
            {/if}
          </select>
        </label>
      </div>
      <div class="modal-action">
        <div
          class={status === Status.ERROR
            ? 'tooltip tooltip-open tooltip-left tooltip-error max-w-fit'
            : 'max-w-fit'}
          data-tip={errorCode ? $t(`error.${errorCode}`) : $t('common.unknown_error')}
        >
          <button
            type="submit"
            class="btn {status === Status.ERROR
              ? 'btn-error'
              : status === Status.SENDING
                ? 'btn-ghost'
                : 'btn-outline border-2 normal-border'} w-full"
            disabled={status === Status.SENDING}
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

<div
  class="card w-80 bg-base-100 overflow-hidden transition border-2 {preferredPlayConfiguration ==
  playConfiguration.id
    ? 'border-primary'
    : 'normal-border'} hover:shadow-lg"
>
  <div class="card-body py-6 gap-0.5 {fixedHeight ? 'h-[390px]' : ''}">
    <div class="join absolute top-5 right-5">
      <button class="btn border-2 normal-border btn-outline btn-warning btn-sm text-lg join-item">
        {playConfiguration.perfectJudgment}
      </button>
      <button class="btn border-2 normal-border btn-outline btn-info btn-sm text-lg join-item">
        {playConfiguration.goodJudgment}
      </button>
    </div>
    <div class="flex gap-2 items-center max-w-[140px] mb-1">
      {#if preferredPlayConfiguration == playConfiguration.id}
        <div class="tooltip tooltip-right tooltip-primary" data-tip={$t('common.preferred')}>
          <button class="btn btn-xs btn-circle btn-primary no-animation">
            <i class="fa-solid fa-star"></i>
          </button>
        </div>
      {/if}
      {#if playConfiguration.name}
        <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
          {playConfiguration.name}
        </h2>
      {/if}
    </div>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.chart_mirroring')}</span>
      {$t(`play_configuration.chart_mirroring_modes.${playConfiguration.chartMirroring}`)}
    </p>
    {#if playConfiguration.aspectRatio && playConfiguration.aspectRatio.length === 2}
      <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge mr-1">{$t('play_configuration.aspect_ratio')}</span>
        {playConfiguration.aspectRatio[0]} : {playConfiguration.aspectRatio[1]}
      </p>
    {/if}
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.note_size')}</span>
      {playConfiguration.noteSize} ×
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.background_luminance')}</span>
      {playConfiguration.backgroundLuminance * 100}%
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.background_blur')}</span>
      {playConfiguration.backgroundBlur} ×
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.simultaneous_note_hint')}</span>
      {playConfiguration.simultaneousNoteHint ? $t('common.on') : $t('common.off')}
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.fc_ap_indicator')}</span>
      {playConfiguration.fcApIndicator ? $t('common.on') : $t('common.off')}
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.chart_offset')}</span>
      {playConfiguration.chartOffset} ms
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.hit_sound_volume')}</span>
      {playConfiguration.hitSoundVolume * 100}%
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('play_configuration.music_volume')}</span>
      {playConfiguration.musicVolume * 100}%
    </p>
    <p class="whitespace-nowrap overflow-hidden text-ellipsis">
      <span class="badge mr-1">{$t('common.created_at')}</span>
      {parseDateTime(playConfiguration.dateCreated, true, user?.language)}
    </p>
    <div class="card-actions mt-4 justify-end">
      <Delete
        id={playConfiguration.id}
        path="player/configurations"
        name="playConfiguration.playConfiguration"
        class="btn-sm btn-square"
      />
      <div class="join">
        <label
          for="play-configuration-update-{playConfiguration.id}"
          class="btn btn-sm border-2 normal-border btn-outline join-item"
        >
          {$t('common.edit')}
        </label>
        <button
          class="btn btn-sm border-2 normal-border btn-outline join-item"
          on:click={() => {
            goto(
              preferredPlayConfiguration == playConfiguration.id
                ? '?preferredPlayConfiguration=none'
                : `?preferredPlayConfiguration=${playConfiguration.id}`,
            );
          }}
        >
          {$t(
            preferredPlayConfiguration == playConfiguration.id
              ? 'common.unset_as_preferred'
              : 'common.set_as_preferred',
          )}
        </button>
      </div>
    </div>
  </div>
</div>
