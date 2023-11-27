<script>
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  export let data;
  $: ({ user, status } = data);
</script>

<svelte:head>
  <title>{$t('pet.title')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    <div class="max-w-3xl">
      <h1 class="text-5xl font-bold">{$t('pet.title')}</h1>
      <p class="py-6 text-lg content">{$t('pet.description')}</p>
      {#if status == 3}
        <p class="pb-6 text-lg text-error">
          {$t('error.UserNotLoggedIn')}
        </p>
      {:else if status == 4}
        <p class="pb-6 text-lg text-success">
          {$t('pet.already_passed')}
        </p>
      {/if}
      <div class="flex gap-2 justify-center w-full">
        {#if status < 2}
          <a data-sveltekit-preload-data="off" href="/pet/objective" class="w-1/2 sm:w-1/4">
            <button class="btn btn-primary btn-outline btn-lg w-full">{$t('pet.start')}</button>
          </a>
        {/if}
        {#if status != 1 && status != 3}
          <a href="/pet/answers" class="w-1/2 sm:w-1/4">
            <button class="btn btn-secondary btn-outline btn-lg w-full">
              {$t(user && getUserPrivilege(user.role) >= 5 ? 'pet.manage' : 'pet.view_history')}
            </button>
          </a>
        {/if}
      </div>
    </div>
  </div>
</div>
