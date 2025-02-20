<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { superForm } from 'sveltekit-superforms';

  import type { PatchElement } from '$lib/api/types';

  import { goto, invalidateAll } from '$app/navigation';
  import ApplicationLink from '$lib/components/ApplicationLink.svelte';
  import Cropper from '$lib/components/ImageCropper.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import PlayConfiguration from '$lib/components/PlayConfiguration.svelte';
  import UpdateSuccess from '$lib/components/UpdateSuccess.svelte';
  import { REGIONS, Status, SUPPORTED_APPS } from '$lib/constants';
  import { locale, locales, t } from '$lib/translations/config';
  import {
    applyPatch,
    getAvatar,
    getUserColor,
    parseDateTime,
    requestIdentity,
    toLocalTime,
  } from '$lib/utils';

  let { data } = $props();
  let { user, api, searchParams, page: playConfigurationPage } = $derived(data);

  const queryClient = useQueryClient();
  const { form, enhance, message, errors, submitting, allErrors } = superForm(data.form);

  const minJudgment = 5;

  let avatarFiles: FileList | undefined = $state();
  let avatarCropping = $state(false);
  let avatarSrc: string | undefined = $state();
  let status = $state(Status.WAITING);
  let errorCode = $state('');
  let dateAvailable: Date | undefined = $state();
  let updateErrors: Map<string, string> | undefined = $state();
  let bindDisabled = $state('');

  let regionMap = $derived(
    new Map(
      [
        ...REGIONS.reduce((map, region) => {
          map.set(region, $t(`region.${region}`));
          return map;
        }, new Map<string, string>()).entries(),
      ].sort((a, b) => a[1].localeCompare(b[1], $locale)),
    ),
  );
  let dateOfBirth = $derived(user.dateOfBirth ? toLocalTime(user.dateOfBirth) : new Date());
  let year = $state((() => dateOfBirth.getFullYear())());
  let month = $state((() => dateOfBirth.getMonth() + 1)());
  let day = $state((() => dateOfBirth.getDate())());
  let badJudgment = $derived($form.goodJudgment * 1.125);
  let playConfigurations = $derived(createQuery(api.playConfiguration.list(searchParams)));

  let rksFactor = $derived.by(() => {
    var x = 0.8 * $form.perfectJudgment + 0.225 * $form.goodJudgment;

    if (x > 150) {
      return 0;
    } else if (x > 100) {
      return (x * x) / 7500 - (4 * x) / 75 + 5;
    } else {
      x -= 100;
      return -((x * x * x) / 4e6) + 1;
    }
  });

  const handleAvatar = () => {
    if (avatarFiles && avatarFiles.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(avatarFiles[0]);
      reader.onload = () => {
        avatarSrc = reader.result as string;
        avatarCropping = true;
      };
    }
  };

  const handleDateOfBirth = () => {
    if (year && month && day) {
      const dateOfBirth = new Date(Date.UTC(year, month - 1, day));
      patch = applyPatch(patch, 'replace', '/dateOfBirth', dateOfBirth.toISOString());
    }
  };

  let patch = $state(new Array<PatchElement>());

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    dateAvailable = undefined;
    updateErrors = undefined;
    const resp = await api.user.update({ id: user.id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      if (data.dateAvailable) dateAvailable = new Date(data.dateAvailable);
      updateErrors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        updateErrors,
      );
    }
  };

  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

  const phigrim = {
    name: 'Phigrim',
    avatar: 'https://res.phizone.cn/Ak0lsqsViHdnJ80o2PVYEv0pmbhQTk4z/phigrim.png',
    branded: false,
  };
</script>

<svelte:head>
  <title>{$t('common.settings')} | {$t('common.site_name')}</title>
</svelte:head>

<UpdateSuccess checked={status === Status.OK} onClick={() => (status = Status.WAITING)} />

{#if avatarCropping}
  <Cropper
    bind:open={avatarCropping}
    title={$t('common.image_cropper')}
    src={avatarSrc!}
    aspectRatio={1}
    rounded
    submit={async (blob) => {
      const resp = await api.user.updateAvatar({ id: user.id, File: blob });
      if (resp.ok) {
        invalidateAll();
        await queryClient.invalidateQueries(api.user.info({ id: user.id }));
        avatarCropping = false;
        status = Status.OK;
      } else {
        const error = await resp.json();
        // TODO: toast
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          error,
        );
      }
    }}
  />
{/if}

<input type="checkbox" id="new-app-link" class="modal-toggle" />
<div class="modal" role="dialog">
  <div class="modal-box max-w-xs overflow-x-hidden">
    <label
      for="new-app-link"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('application.bind_account')}</h3>
    <div class="flex flex-col gap-2">
      {#each SUPPORTED_APPS as app}
        <button
          class="btn btn-lg btn-outline border-2 normal-border inline-flex items-center gap-2 w-full"
          disabled={bindDisabled === app.name}
          onclick={async () => {
            bindDisabled = app.name;
            await requestIdentity(app.name, api, true);
            bindDisabled = '';
          }}
        >
          {#if app.branded}
            <i class="fa-brands fa-{app.name.toLowerCase()} fa-xl"></i>
          {:else}
            <div class="avatar">
              <div class="w-6 rounded-full">
                <img src={getAvatar(app.avatar)} alt="Avatar" />
              </div>
            </div>
          {/if}
          <p>{app.name}</p>
        </button>
      {/each}
      <button
        class="btn btn-lg btn-outline border-2 normal-border inline-flex items-center gap-2 w-full"
        onclick={() => goto('/me/inherit')}
      >
        <div class="avatar">
          <div class="w-6 rounded-full">
            <img src={getAvatar(phigrim.avatar)} alt="Avatar" />
          </div>
        </div>
        <p>{phigrim.name}</p>
      </button>
    </div>
  </div>
</div>

<input
  type="checkbox"
  id="new-play-configuration"
  class="modal-toggle"
  checked={$submitting || $allErrors.length > 0}
/>
<div class="modal" role="dialog">
  <div class="modal-box min-w-[30vw] overflow-x-hidden">
    <label
      for="new-play-configuration"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('play_configuration.play_configuration')}</h3>
    <form method="POST" class="w-full form-control gap-4" use:enhance>
      <div class="flex w-full pt-6">
        <div
          class="tooltip {$form.perfectJudgment < 45
            ? 'tooltip-right'
            : ''} tooltip-warning leading-[0px] h-[7.5px]"
          data-tip="{$t('play_configuration.perfect')} ({$form.perfectJudgment}ms)"
          style:width="{$form.perfectJudgment / 3.5}%"
        >
          <progress value="1" max="1" class="progress progress-warning"></progress>
        </div>
        <div
          class="tooltip {$form.goodJudgment < 40
            ? 'tooltip-right'
            : ''} tooltip-info leading-[0px] h-[7.5px]"
          data-tip="{$t('play_configuration.good')} ({$form.goodJudgment}ms)"
          style:width="{($form.goodJudgment - $form.perfectJudgment) / 3.5}%"
        >
          <progress value="1" max="1" class="progress progress-info"></progress>
        </div>
        <div
          class="tooltip {$form.goodJudgment < 25
            ? 'tooltip-right'
            : ''} tooltip-error leading-[0px] h-[7.5px]"
          data-tip="{$t('play_configuration.bad')} ({badJudgment}ms)"
          style:width="{(badJudgment - $form.goodJudgment) / 3.5}%"
        >
          <progress value="1" max="1" class="progress progress-error"></progress>
        </div>
        <div
          class="tooltip {$form.goodJudgment > 225 ? 'tooltip-left' : ''} leading-[0px] h-[7.5px]"
          data-tip={$t('play_configuration.miss_or_incoming')}
          style:width="{100 - badJudgment / 3.5}%"
        >
          <progress value="0" max="1" class="progress"></progress>
        </div>
      </div>
      <div class="form-control">
        <div
          class={$errors.perfectJudgment ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.perfectJudgment ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.perfect')} (ms)</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="perfect_judgment"
              name="perfectJudgment"
              min={minJudgment}
              max="150"
              bind:value={$form.perfectJudgment}
              class={`range join-item w-7/12 ${$errors.perfectJudgment ? 'range-error' : ''}`}
              oninput={(e) => {
                const perfectJudgment = parseInt(e.currentTarget.value);
                if (
                  $form.goodJudgment <
                  Math.max(perfectJudgment + minJudgment, perfectJudgment * 1.125)
                ) {
                  $form.goodJudgment = Math.round(
                    Math.max(perfectJudgment + minJudgment, perfectJudgment * 1.125),
                  );
                }
              }}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.perfectJudgment}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.perfectJudgment}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < minJudgment) {
                  e.currentTarget.value = `${minJudgment}`;
                } else if (parseInt(e.currentTarget.value) > 150) {
                  e.currentTarget.value = '150';
                }
                $form.perfectJudgment = parseInt(e.currentTarget.value);
                if (
                  $form.goodJudgment <
                  Math.max($form.perfectJudgment + minJudgment, $form.perfectJudgment * 1.125)
                ) {
                  $form.goodJudgment = Math.round(
                    Math.max($form.perfectJudgment + minJudgment, $form.perfectJudgment * 1.125),
                  );
                }
              }}
            />
          </div>
        </div>
        <div
          class={$errors.goodJudgment ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.goodJudgment ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.good')} (ms)</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="good_judgment"
              name="goodJudgment"
              min={Math.round(
                Math.max($form.perfectJudgment + minJudgment, $form.perfectJudgment * 1.125),
              )}
              max="300"
              bind:value={$form.goodJudgment}
              class={`range join-item w-7/12 ${$errors.goodJudgment ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.goodJudgment}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${Math.round($form.goodJudgment)}`;
                  return;
                }
                if (
                  parseInt(e.currentTarget.value) <
                  Math.max($form.perfectJudgment + minJudgment, $form.perfectJudgment * 1.125)
                ) {
                  e.currentTarget.value = `${Math.round(
                    Math.max($form.perfectJudgment + minJudgment, $form.perfectJudgment * 1.125),
                  )}`;
                } else if (parseInt(e.currentTarget.value) > 300) {
                  e.currentTarget.value = '300';
                }
                $form.goodJudgment = parseInt(e.currentTarget.value);
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
            class={$errors.simultaneousNoteHint
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-1/2'
              : 'w-1/2'}
            data-tip={$errors.simultaneousNoteHint ?? ''}
          >
            <div class="flex items-center">
              <span class="w-1/2">{$t('play_configuration.simultaneous_note_hint')}</span>
              <input
                type="checkbox"
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                id="simultaneous_note_hint"
                name="simultaneousNoteHint"
                bind:checked={$form.simultaneousNoteHint}
                class={`toggle border-2 transition ${
                  $errors.simultaneousNoteHint ? 'toggle-error' : ''
                }`}
              />
            </div>
          </div>
          <div
            class={$errors.fcApIndicator
              ? 'tooltip tooltip-open tooltip-bottom tooltip-error w-1/2'
              : 'w-1/2'}
            data-tip={$errors.fcApIndicator ?? ''}
          >
            <div class="flex items-center">
              <span class="w-1/2">{$t('play_configuration.fc_ap_indicator')}</span>
              <input
                type="checkbox"
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                id="fc_ap_indicator"
                name="fcApIndicator"
                bind:checked={$form.fcApIndicator}
                class={`toggle border-2 transition ${$errors.fcApIndicator ? 'toggle-error' : ''}`}
              />
            </div>
          </div>
        </div>
        <div
          class={$errors.noteSize ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.noteSize ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.note_size')}</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="note_size"
              name="noteSize"
              min="0.4"
              max="2"
              step="0.1"
              bind:value={$form.noteSize}
              class={`range join-item w-7/12 ${$errors.noteSize ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.noteSize}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?([0-9]*[.])?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.noteSize}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                $form.noteSize = parseFloat(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div
          class={$errors.backgroundLuminance
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}
          data-tip={$errors.backgroundLuminance ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.background_luminance')} (%)</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="background_luminance"
              name="backgroundLuminance"
              min="0"
              max="100"
              bind:value={$form.backgroundLuminance}
              class={`range join-item w-7/12 ${$errors.backgroundLuminance ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.backgroundLuminance}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.backgroundLuminance}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                $form.backgroundLuminance = parseInt(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div
          class={$errors.backgroundBlur ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.backgroundBlur ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.background_blur')}</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="background_blur"
              name="backgroundBlur"
              min="0"
              max="2"
              step="0.1"
              bind:value={$form.backgroundBlur}
              class={`range join-item w-7/12 ${$errors.backgroundBlur ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.backgroundBlur}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?([0-9]*[.])?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.backgroundBlur}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                $form.backgroundBlur = parseFloat(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div
          class={$errors.chartOffset ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.chartOffset ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.chart_offset')} (ms)</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="chart_offset"
              name="chartOffset"
              min="-600"
              max="600"
              bind:value={$form.chartOffset}
              class={`range join-item w-7/12 ${$errors.chartOffset ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.chartOffset}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.chartOffset}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                $form.chartOffset = parseInt(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div
          class={$errors.hitSoundVolume ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.hitSoundVolume ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.hit_sound_volume')} (%)</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="hit_sound_volume"
              name="hitSoundVolume"
              min="0"
              max="100"
              bind:value={$form.hitSoundVolume}
              class={`range join-item w-7/12 ${$errors.hitSoundVolume ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.hitSoundVolume}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.hitSoundVolume}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                $form.hitSoundVolume = parseInt(e.currentTarget.value);
              }}
            />
          </div>
        </div>
        <div
          class={$errors.musicVolume ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
          data-tip={$errors.musicVolume ?? ''}
        >
          <div class="flex items-center">
            <span class="w-1/4">{$t('play_configuration.music_volume')} (%)</span>
            <input
              type="range"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="music_volume"
              name="musicVolume"
              min="0"
              max="100"
              bind:value={$form.musicVolume}
              class={`range join-item w-7/12 ${$errors.musicVolume ? 'range-error' : ''}`}
            />
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              value={$form.musicVolume}
              class="input w-1/6 text-right text-xl font-bold"
              onfocusout={(e) => {
                if (!/^[+-]?[0-9]+$/.test(e.currentTarget.value)) {
                  e.currentTarget.value = `${$form.musicVolume}`;
                  return;
                }
                if (parseInt(e.currentTarget.value) < 0) {
                  e.currentTarget.value = '0';
                } else if (parseInt(e.currentTarget.value) > 100) {
                  e.currentTarget.value = '100';
                }
                $form.musicVolume = parseInt(e.currentTarget.value);
              }}
            />
          </div>
        </div>
      </div>
      <div
        class={$errors.name
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error relative'
          : 'relative'}
        data-tip={$errors.name ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.name')}
          </span>
          <input
            type="text"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="name"
            name="name"
            bind:value={$form.name}
            placeholder={`${$t('common.name')}${$t('common.optional')}`}
            class={`input transition border-2 normal-border join-item w-3/4 ${
              $errors.name ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
        <button
          type="button"
          class="absolute right-2 top-[7.5px] btn btn-sm {$form.name
            ? 'border-2 hover:btn-outline backdrop-blur'
            : 'btn-disabled'}"
          onclick={() => {
            $form.name = undefined;
          }}
        >
          {$t('common.empty_v')}
        </button>
      </div>
      <div
        class={$errors.chartMirroring ? 'tooltip tooltip-open tooltip-bottom tooltip-error' : ''}
        data-tip={$errors.chartMirroring ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('play_configuration.chart_mirroring')}
          </span>
          <select
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="chart_mirroring"
            name="chartMirroring"
            bind:value={$form.chartMirroring}
            class={`select transition border-2 normal-border join-item w-3/4 ${
              $errors.chartMirroring ? 'hover:select-error' : 'hover:select-secondary'
            }`}
          >
            {#each [0, 1, 2, 3] as value}
              <option {value}>{$t(`play_configuration.chart_mirroring_modes.${value}`)}</option>
            {/each}
          </select>
        </label>
      </div>
      <div
        class={$errors.aspectRatio1 || $errors.aspectRatio2
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
          : ''}
        data-tip={$errors.aspectRatio1 ?? $errors.aspectRatio2 ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('play_configuration.aspect_ratio')}
          </span>
          <select
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="aspect_ratio_1"
            name="aspectRatio1"
            bind:value={$form.aspectRatio1}
            class={`select transition border-2 normal-border join-item w-[37.5%] ${
              $errors.aspectRatio1 ? 'hover:select-error' : 'hover:select-secondary'
            }`}
          >
            <option value={0}>{$t('common.auto')}</option>
            {#each Array.from({ length: 30 }, (_, index) => index + 1) as value}
              <option {value}>{value}</option>
            {/each}
          </select>
          <select
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="aspect_ratio_2"
            name="aspectRatio2"
            bind:value={$form.aspectRatio2}
            class={`select transition border-2 normal-border join-item w-[37.5%] ${
              $errors.aspectRatio2 ? 'hover:select-error' : 'hover:select-secondary'
            }`}
          >
            {#if $form.aspectRatio1 > 0}
              {#each Array.from({ length: $form.aspectRatio1 }, (_, index) => index + 1).filter((number) => gcd(number, $form.aspectRatio1) === 1) as value}
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
          class="{$message ? 'tooltip tooltip-open tooltip-left tooltip-error' : ''} max-w-fit"
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

<div class="page">
  <div class="pb-24 flex justify-center">
    <div class="mx-4 lg:w-[60vw] max-w-7xl">
      <h1 class="text-4xl font-bold mb-6">
        {$t('common.settings')}
      </h1>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('common.profile')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body gap-4 py-10">
            <div class="flex gap-2 items-center w-full">
              <span class="w-1/6">
                {$t('user.avatar')}
              </span>
              <div class="avatar w-5/6 flex flex-col sm:flex-row items-center">
                <div
                  class="mx-auto rounded-full m-2 overflow-hidden border-[4px] border-{getUserColor(
                    user.role ?? '',
                  )} w-[70px] h-[70px] md:w-[140px] md:h-[140px]"
                >
                  <img class="object-fill" src={getAvatar(user.avatar, 100)} alt="Avatar" />
                </div>
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png, .webp"
                  class="w-full sm:w-1/3 file:mr-2 file:py-2 file:border-0 file:btn input-secondary file:btn-outline file:bg-secondary"
                  bind:files={avatarFiles}
                  onchange={handleAvatar}
                />
                <span class="hidden sm:inline sm:w-1/3">{$t('common.form.tips.image')}</span>
              </div>
            </div>
            <form class="form-control" onsubmit={(e) => e.preventDefault()}>
              <input type="number" name="id" value={user.id} hidden />
              <label class="join w-full mt-2">
                <span
                  class="btn no-animation join-item w-1/3 md:w-1/6 overflow-hidden text-ellipsis"
                >
                  {$t('user.gender')}
                </span>
                <select
                  bind:value={user.gender}
                  name="Gender"
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-2/3 md:w-5/6"
                  oninput={(e) => {
                    patch = applyPatch(patch, 'replace', '/gender', e.currentTarget.value);
                  }}
                >
                  {#each [0, 1, 2] as value}
                    <option {value}>{$t(`user.genders.${value}`)}</option>
                  {/each}
                </select>
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!updateErrors?.get('Gender')}
                data-tip={updateErrors?.get('Gender')}
              ></div>
              <label class="join w-full mt-2">
                <span
                  class="btn no-animation join-item w-1/3 md:w-1/6 overflow-hidden text-ellipsis"
                >
                  {$t('user.username')}
                </span>
                <input
                  type="text"
                  name="UserName"
                  placeholder={$t('user.username')}
                  class="input transition border-2 normal-border hover:input-secondary join-item flex-shrink w-2/3 md:w-5/6"
                  value={user.userName}
                  oninput={(e) => {
                    patch = applyPatch(patch, 'replace', '/userName', e.currentTarget.value);
                  }}
                />
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!updateErrors?.get('UserName')}
                data-tip={updateErrors?.get('UserName')}
              ></div>
              <label class="join w-full mt-2">
                <span
                  class="btn no-animation join-item w-1/3 md:w-1/6 overflow-hidden text-ellipsis"
                >
                  {$t('user.language')}
                </span>
                <select
                  bind:value={$locale}
                  name="Language"
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-2/3 md:w-5/6"
                  oninput={(e) => {
                    patch = applyPatch(patch, 'replace', '/language', e.currentTarget.value);
                  }}
                >
                  {#each $locales as value}
                    <option {value}>
                      {$t(`common.lang.${value}`)}
                      {#if $locale !== value}
                        - {$t(`lang.${value}`)}
                      {/if}
                    </option>
                  {/each}
                </select>
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!updateErrors?.get('Language')}
                data-tip={updateErrors?.get('Language')}
              ></div>
              <label class="join w-full mt-2">
                <span
                  class="btn no-animation join-item w-1/3 md:w-1/6 overflow-hidden text-ellipsis"
                >
                  {$t('user.region')}
                </span>
                <select
                  name="RegionCode"
                  class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-2/3 md:w-5/6"
                  oninput={(e) => {
                    user.region.code = e.currentTarget.value;
                    patch = applyPatch(patch, 'replace', '/regionCode', e.currentTarget.value);
                  }}
                >
                  {#each regionMap as region}
                    <option value={region[0]} selected={region[0] == user.region.code}>
                      {region[1]}
                    </option>
                  {/each}
                </select>
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!updateErrors?.get('RegionCode')}
                data-tip={updateErrors?.get('RegionCode')}
              ></div>
              <label class="join w-full mt-2">
                <span
                  class="btn no-animation join-item w-1/3 md:w-1/6 overflow-hidden text-ellipsis"
                >
                  {$t('user.date_of_birth')}
                </span>
                <div class="join w-2/3 md:w-5/6">
                  <select
                    name="YearOfBirth"
                    class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/3"
                    oninput={(e) => {
                      year = parseInt(e.currentTarget.value);
                      handleDateOfBirth();
                    }}
                  >
                    {#each Array.from({ length: 121 }, (_, i) => new Date().getUTCFullYear() - 120 + i) as y}
                      <option value={y} selected={y == year}>
                        {y}
                      </option>
                    {/each}
                  </select>
                  <select
                    name="MonthOfBirth"
                    class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/3"
                    oninput={(e) => {
                      month = parseInt(e.currentTarget.value);
                      handleDateOfBirth();
                    }}
                  >
                    {#each Array.from({ length: 12 }, (_, i) => i + 1) as m}
                      <option value={m} selected={m == month}>
                        {m}
                      </option>
                    {/each}
                  </select>
                  <select
                    name="DayOfBirth"
                    class="select transition border-2 normal-border hover:input-secondary join-item flex-shrink w-1/3"
                    oninput={(e) => {
                      day = parseInt(e.currentTarget.value);
                      handleDateOfBirth();
                    }}
                  >
                    {#each Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1) as d}
                      <option value={d} selected={d == day}>
                        {d}
                      </option>
                    {/each}
                  </select>
                </div>
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!updateErrors?.get('DateOfBirth')}
                data-tip={updateErrors?.get('DateOfBirth')}
              ></div>
              <div class="relative mt-2">
                <label class="join w-full">
                  <span
                    class="btn no-animation join-item w-1/3 md:w-1/6 overflow-hidden text-ellipsis"
                  >
                    {$t('user.bio')}
                  </span>
                  <textarea
                    placeholder={$t('user.bio')}
                    name="Bio"
                    class="textarea transition border-2 normal-border hover:textarea-secondary join-item w-2/3 md:w-5/6 h-48"
                    bind:value={user.biography}
                    oninput={(e) => {
                      patch = applyPatch(patch, 'replace', '/biography', e.currentTarget.value);
                    }}
                  ></textarea>
                </label>
                <button
                  type="button"
                  class="absolute right-2 bottom-2 btn btn-sm {user.biography
                    ? 'border-2 hover:btn-outline backdrop-blur'
                    : 'btn-disabled'}"
                  onclick={() => {
                    if (!user) return;
                    user.biography = '';
                    patch = applyPatch(patch, 'remove', '/biography');
                  }}
                >
                  {$t('common.empty_v')}
                </button>
              </div>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!updateErrors?.get('Biography')}
                data-tip={updateErrors?.get('Biography')}
              ></div>
              <div class="flex justify-center mt-2">
                <div
                  class="tooltip tooltip-top tooltip-error w-full"
                  class:tooltip-open={status === Status.ERROR}
                  data-tip={status === Status.ERROR
                    ? dateAvailable
                      ? `${
                          errorCode ? $t(`error.${errorCode}`) : $t('common.unknown_error')
                        }\n\n${$t('common.date_available')}${$t('common.colon')}${parseDateTime(
                          dateAvailable,
                        )}`
                      : errorCode
                        ? $t(`error.${errorCode}`)
                        : $t('common.unknown_error')
                    : null}
                >
                  <button
                    class="btn {status === Status.ERROR
                      ? 'btn-error'
                      : status === Status.SENDING
                        ? 'btn-ghost'
                        : 'btn-outline border-2 normal-border'} w-full"
                    disabled={status == Status.SENDING}
                    onclick={update}
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
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('user.linked_accounts')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body gap-4 py-10">
            <label
              for="new-app-link"
              class="btn border-2 normal-border btn-outline btn-sm btn-circle absolute right-2 top-2"
            >
              <i class="fa-solid fa-plus fa-lg"></i>
            </label>
            {#if user.applicationLinks && user.applicationLinks.length > 0}
              <div class="result">
                {#each user.applicationLinks as appLink}
                  <div class="min-w-fit">
                    <ApplicationLink {appLink} />
                  </div>
                {/each}
              </div>
            {:else}
              <p class="py-3 text-center">{$t('common.empty')}</p>
            {/if}
          </div>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('play_configuration.play_configuration')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body gap-4 py-10">
            <label
              for="new-play-configuration"
              class="btn border-2 normal-border btn-outline btn-sm btn-circle absolute right-2 top-2"
            >
              <i class="fa-solid fa-plus fa-lg"></i>
            </label>
            {#if $playConfigurations.isSuccess}
              {@const { total, perPage, data } = $playConfigurations.data}
              {#if total && perPage && data.length > 0}
                <div class="result">
                  {#each data as playConfiguration}
                    <div class="min-w-fit">
                      <PlayConfiguration {playConfiguration} />
                    </div>
                  {/each}
                </div>
                <Paginator {total} {perPage} page={playConfigurationPage} {searchParams} />
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
