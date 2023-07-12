<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query';
  import { invalidateAll } from '$app/navigation';
  import { locales, t } from '$lib/translations/config';
  import AvatarCropper from './AvatarCropper.svelte';
  import { enhance } from '$app/forms';

  export let data;

  $: ({ api } = data);
  const queryClient = useQueryClient();

  $: user = data.user!;

  let avatarFiles: FileList;
  let avatarCropping = false;
  let avatarSrc: string;

  const handleAvatar = () => {
    if (avatarFiles.length > 0) {
      const fd = new FileReader();
      fd.readAsDataURL(avatarFiles[0]);
      fd.onload = () => {
        avatarSrc = fd.result as string;
        avatarCropping = true;
      };
    }
  };
</script>

<svelte:head>
  <title>{$t('common.settings')} | {$t('common.title')}</title>
</svelte:head>

{#if avatarCropping}
  <AvatarCropper id={user.id} bind:open={avatarCropping} src={avatarSrc} />
{/if}

<div class="bg-base-200 page">
  <div class="pt-32 pb-24 flex justify-center">
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
            <div class="avatar gap-4 items-center min-w-fit h-fit">
              <span class="w-16 min-w-fit px-4 place-self-center">{$t('user.avatar')}</span>
              <div
                class="mx-auto min-w-fit w-[140px] h-[140px] rounded-full m-2 overflow-hidden border-[4px] {user.type ==
                'admin'
                  ? 'border-indigo-500'
                  : user.type == 'volunteer'
                  ? 'border-emerald-500'
                  : user.type == 'qualified'
                  ? 'border-sky-500'
                  : 'border-neutral-500'}"
              >
                <img class="object-fill" src={user.avatar} alt="Avatar" />
              </div>
              <input
                type="file"
                accept=".jpg, .jpeg, .png, .webp"
                class="mb-2 w-64 file:mr-2 file:py-2 file:border-0 file:btn input-primary file:btn-outline file:bg-primary"
                bind:files={avatarFiles}
                on:change={handleAvatar}
              />
              <span>{$t('common.form.tips.image')}</span>
            </div>
            <form
              class="form-control gap-4"
              method="POST"
              use:enhance={() => {
                return async ({ result, update }) => {
                  if (result.type === 'failure') {
                    // TODO: ?
                  } else if (result.type === 'success') {
                    await invalidateAll();
                    await queryClient.invalidateQueries(['user.info', { id: user.id }]);
                  }
                  await update();
                };
              }}
            >
              <input type="number" name="id" value={user.id} hidden />
              <input type="text" name="old_username" value={user.username} hidden />
              <label class="input-group">
                <span class="w-[12%] min-w-fit">{$t('user.username')}</span>
                <input
                  type="text"
                  name="username"
                  placeholder={$t('user.username')}
                  class="input input-primary w-[88%] min-w-[180px]"
                  value={user.username}
                />
              </label>
              <div class="flex items-center justify-between">
                <span class="w-16 min-w-fit px-4 place-self-center">{$t('user.gender')}</span>
                <div class="flex justify-between w-[60%]">
                  <div class="flex gap-2 w-1/3">
                    <input
                      type="radio"
                      group={user.gender}
                      name="gender"
                      value={0}
                      class="radio radio-primary"
                    />
                    <p>
                      {$t('user.gender_0')}
                    </p>
                  </div>
                  <div class="flex gap-2 w-1/3">
                    <input
                      type="radio"
                      group={user.gender}
                      name="gender"
                      value={1}
                      class="radio radio-primary"
                    />
                    <p>
                      {$t('user.gender_1')}
                    </p>
                  </div>
                  <div class="flex gap-2 w-1/3">
                    <input
                      type="radio"
                      group={user.gender}
                      name="gender"
                      value={2}
                      class="radio radio-primary"
                    />
                    <p>
                      {$t('user.gender_2')}
                    </p>
                  </div>
                </div>
              </div>
              <label class="input-group">
                <span class="w-[12%] min-w-fit">{$t('user.language')}</span>
                <select
                  value={user.language}
                  name="language"
                  class="select input-primary flex-shrink w-[88%] min-w-[180px]"
                >
                  {#each $locales as value}
                    <option {value}>{$t(`lang.${value}`)}</option>
                  {/each}
                </select>
              </label>
              <label class="input-group">
                <span class="w-[12%] min-w-fit">{$t('user.bio')}</span>
                <textarea
                  placeholder={$t('user.bio')}
                  name="bio"
                  class="textarea textarea-primary rounded-none w-[88%] min-w-[180px] h-48"
                  value={user.bio}
                />
              </label>
              <div class="flex justify-center">
                <button class="btn btn-primary" type="submit">{$t('common.submit')}</button>
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
