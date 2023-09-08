<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query';
  import { invalidateAll } from '$app/navigation';
  import { locales, locale, t } from '$lib/translations/config';
  import { Status, regions } from '$lib/constants';
  import Cropper from '$lib/components/ImageCropper.svelte';
  import { applyPatch, getAvatar, getUserColor, parseDateTime } from '$lib/utils';
  import type { PatchElement } from '$lib/api/types';

  export let data;

  $: ({ api } = data);
  const queryClient = useQueryClient();

  $: user = data.user!;
  $: ({ id } = user);

  let avatarFiles: FileList;
  let avatarCropping = false;
  let avatarSrc: string;
  let status = Status.WAITING;
  let errorCode = '';
  let dateAvailable: Date | undefined = undefined;
  let errors: Map<string, string> | undefined = undefined;

  $: regionMap = new Map(
    [
      ...regions
        .reduce((map, region) => {
          map.set(region, $t(`region.${region}`));
          return map;
        }, new Map<string, string>())
        .entries(),
    ].sort((a, b) => a[1].localeCompare(b[1], $locale)),
  );

  const handleAvatar = () => {
    if (avatarFiles.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(avatarFiles[0]);
      reader.onload = () => {
        avatarSrc = reader.result as string;
        avatarCropping = true;
      };
    }
  };

  let patch = new Array<PatchElement>();

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    dateAvailable = undefined;
    errors = undefined;
    const resp = await api.user.update({ id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      if (data.dateAvailable) dateAvailable = new Date(data.dateAvailable);
      errors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(errors);
    }
  };
</script>

<svelte:head>
  <title>{$t('common.settings')} | {$t('common.title')}</title>
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

{#if avatarCropping}
  <Cropper
    bind:open={avatarCropping}
    title={$t('common.image_cropper')}
    src={avatarSrc}
    aspectRatio={1}
    on:submit={async (e) => {
      const resp = await api.user.updateAvatar({ id, File: e.detail });
      if (resp.ok) {
        invalidateAll();
        queryClient.invalidateQueries(['user.info', { id }]);
        avatarCropping = false;
        status = Status.OK;
      } else {
        const error = await resp.json();
        // TODO: toast
        console.error(error);
      }
    }}
  />
{/if}

<div class="bg-base-200 page">
  <div class="pb-24 flex justify-center">
    <div class="mx-4 min-w-[890px] w-[60vw] max-w-[1150px]">
      <h1 class="text-4xl font-bold mb-6">
        {$t('common.settings')}
      </h1>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('common.profile')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body gap-4 py-10">
            <div class="avatar gap-4 items-center w-full">
              <span class="w-1/6 min-w-fit place-self-center">
                {$t('user.avatar')}
              </span>
              <div
                class="mx-auto w-1/6 rounded-full m-2 overflow-hidden border-[4px] border-{getUserColor(
                  user.role,
                )}"
              >
                <img
                  class="object-fill w-[140px] h-[140px]"
                  src={getAvatar(user.avatar, 100)}
                  alt="Avatar"
                />
              </div>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .webp"
                class="mb-2 w-1/3 file:mr-2 file:py-2 file:border-0 file:btn input-secondary file:btn-outline file:bg-secondary"
                bind:files={avatarFiles}
                on:change={handleAvatar}
              />
              <span class="w-1/3">{$t('common.form.tips.image')}</span>
            </div>
            <form class="form-control">
              <input type="number" name="id" value={id} hidden />
              <div class="flex items-center justify-between mb-2">
                <span class="w-16 min-w-fit place-self-center">{$t('user.gender')}</span>
                <div class="flex justify-between w-[60%]">
                  <div class="flex gap-2 w-1/3">
                    <input
                      type="radio"
                      bind:group={user.gender}
                      name="gender"
                      value={0}
                      class="radio radio-secondary"
                      on:input={() => {
                        patch = applyPatch(patch, 'replace', '/gender', 0);
                      }}
                    />
                    <p>
                      {$t('user.genders.0')}
                    </p>
                  </div>
                  <div class="flex gap-2 w-1/3">
                    <input
                      type="radio"
                      bind:group={user.gender}
                      name="gender"
                      value={1}
                      class="radio radio-secondary"
                      on:input={() => {
                        patch = applyPatch(patch, 'replace', '/gender', 1);
                      }}
                    />
                    <p>
                      {$t('user.genders.1')}
                    </p>
                  </div>
                  <div class="flex gap-2 w-1/3">
                    <input
                      type="radio"
                      bind:group={user.gender}
                      name="gender"
                      value={2}
                      class="radio radio-secondary"
                      on:input={() => {
                        patch = applyPatch(patch, 'replace', '/gender', 2);
                      }}
                    />
                    <p>
                      {$t('user.genders.2')}
                    </p>
                  </div>
                </div>
              </div>
              <label class="join w-full mt-2">
                <span class="btn no-animation join-item w-[12%] min-w-fit">
                  {$t('user.username')}
                </span>
                <input
                  type="text"
                  name="username"
                  placeholder={$t('user.username')}
                  class="input input-secondary join-item w-[88%] min-w-[180px]"
                  value={user.userName}
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/userName', e.currentTarget.value);
                  }}
                />
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!errors?.get('UserName')}
                data-tip={errors?.get('UserName')}
              />
              <label class="join w-full mt-2">
                <span class="btn no-animation join-item w-[12%] min-w-fit">
                  {$t('user.language')}
                </span>
                <select
                  bind:value={$locale}
                  name="language"
                  class="select input-secondary join-item flex-shrink w-[88%] min-w-[180px]"
                  on:input={(e) => {
                    locale.set(e.currentTarget.value);
                    patch = applyPatch(patch, 'replace', '/language', e.currentTarget.value);
                  }}
                >
                  {#each $locales as value}
                    <option {value}>{$t(`common.lang.${value}`)}</option>
                  {/each}
                </select>
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!errors?.get('Language')}
                data-tip={errors?.get('Language')}
              />
              <label class="join w-full mt-2">
                <span class="btn no-animation join-item w-[12%] min-w-fit">
                  {$t('user.region')}
                </span>
                <select
                  bind:value={user.region}
                  name="region"
                  class="select input-secondary join-item flex-shrink w-[88%] min-w-[180px]"
                  on:input={(e) => {
                    patch = applyPatch(patch, 'replace', '/regionCode', e.currentTarget.value);
                  }}
                >
                  {#each regionMap as region}
                    <option value={region[0]}>{region[1]}</option>
                  {/each}
                </select>
              </label>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!errors?.get('RegionCode')}
                data-tip={errors?.get('RegionCode')}
              />
              <div class="relative mt-2">
                <label class="join w-full">
                  <span class="btn no-animation join-item w-[12%] min-w-fit">
                    {$t('user.bio')}
                  </span>
                  <textarea
                    placeholder={$t('user.bio')}
                    name="bio"
                    class="textarea textarea-secondary join-item w-[88%] min-w-[180px] h-48"
                    bind:value={user.biography}
                    on:input={(e) => {
                      patch = applyPatch(patch, 'replace', '/biography', e.currentTarget.value);
                    }}
                  />
                </label>
                <button
                  type="button"
                  class="absolute right-2 top-2 btn btn-accent btn-outline btn-sm backdrop-blur"
                  on:click={() => {
                    user.biography = '';
                    patch = applyPatch(patch, 'remove', '/biography');
                  }}
                >
                  {$t('common.empty_v')}
                </button>
              </div>
              <div
                class="tooltip tooltip-bottom tooltip-error mb-2"
                class:tooltip-open={!!errors?.get('Biography')}
                data-tip={errors?.get('Biography')}
              />
              <div class="flex justify-center mt-2">
                <div
                  class="tooltip tooltip-top tooltip-error w-full"
                  class:tooltip-open={status === Status.ERROR}
                  data-tip={status === Status.ERROR
                    ? dateAvailable
                      ? `${$t(`error.${errorCode}`) ?? $t('common.unknown_error')}\n\n${$t(
                          'common.date_available',
                        )}${$t('common.colon')}${parseDateTime(dateAvailable)}`
                      : $t(`error.${errorCode}`) ?? $t('common.unknown_error')
                    : null}
                >
                  <button
                    class="btn {status === Status.ERROR
                      ? 'btn-error'
                      : status === Status.SENDING
                      ? 'btn-ghost'
                      : 'btn-primary btn-outline'} w-full"
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
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
