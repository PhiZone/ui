<script>
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  export let data;
  $: ({ user, status } = data);
</script>

<svelte:head>
  <title>{$t('pet.title')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-3xl">
      <h1 class="text-5xl font-bold">{$t('pet.title')}</h1>
      {#if status < 3}
        <p class="py-6 text-lg">{$t('pet.description')}</p>
        {#if status < 2}
          <a data-sveltekit-preload-data="off" href="/pet/objective">
            <button class="btn btn-primary btn-outline btn-lg">{$t('pet.start')}</button>
          </a>
        {/if}
        {#if status != 1}
          <a data-sveltekit-preload-data="off" href="/pet/answers">
            <button class="btn btn-secondary btn-outline btn-lg">
              {$t(user && getUserPrivilege(user.role) >= 3 ? 'pet.manage' : 'pet.view_history')}
            </button>
          </a>
        {/if}
      {:else if status == 3}
        <p class="py-6 text-lg text-red-600">
          {$t('error.UserNotLoggedIn')}
        </p>
      {:else if status == 4}
        <p class="py-6 text-lg text-red-600">
          {$t('pet.already_passed')}
        </p>
      {/if}
    </div>
  </div>
</div>
