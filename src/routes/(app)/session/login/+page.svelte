<script lang="ts">
  import { POST } from '$lib/utils';
  import { locale, t } from '$lib/translations/config';
  import { Status } from '$lib/constants';
  import { page } from '$app/stores';

  let email = '';
  let password = '';
  let msg = '';

  let status = Status.WAITING;

  const login = async () => {
    if (!email || !password) {
      msg = $t('session.data_incomplete');
      return;
    }
    status = Status.SENDING;
    const resp = await POST('/auth/login', { email, password }, locale.get());
    const json = await resp.json();
    const redirect = $page.url.searchParams.get('redirect');
    if (json.code === 200) {
      window.location.href = redirect ? redirect : '/';
    } else {
      status = Status.ERROR;
      msg = $t(json.code == 400 ? 'session.login.invalid_credentials' : 'common.unknown_error');
    }
  };
</script>

<svelte:head>
  <title>{$t('session.login.login')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content form-control lg:flex-row-reverse">
    <div class="px-10 text-center lg:text-left">
      <h1 class="text-5xl font-bold">
        {$t('session.login.login')}
      </h1>
      <p class="py-6">
        {$t('session.login.login_text')}
      </p>
    </div>
    <div class="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
      <div class="card-body">
        <form>
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">{$t('session.email')}</span>
            </label>
            <input
              type="email"
              placeholder={$t('session.email')}
              autocomplete="username"
              class="input input-bordered"
              on:input={() => {
                msg = '';
              }}
              bind:value={email}
            />
          </div>
          <div class="form-control">
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label">
              <span class="label-text">{$t('session.password')}</span>
            </label>
            <input
              type="password"
              placeholder={$t('session.password')}
              autocomplete="current-password"
              class="input input-bordered"
              on:input={() => {
                msg = '';
              }}
              bind:value={password}
            />
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="label flex justify-between">
              <a href="/session/password-reset" class="label-text-alt link link-hover">
                {$t('session.login.forgot_password')}</a
              >
              <a href="/session/register" class="label-text-alt link link-hover">
                {$t('session.registration.register')}</a
              >
            </label>
          </div>
          <div class="flex justify-center mt-6">
            {#if msg}
              <div class="tooltip tooltip-open tooltip-bottom tooltip-error w-full" data-tip={msg}>
                <button class="btn btn-error w-full">{$t('common.error')}</button>
              </div>
            {:else if status === Status.SENDING}
              <button class="btn btn-ghost btn-disabled glass w-full">{$t('common.waiting')}</button
              >
            {:else}
              <button class="btn btn-secondary btn-outline glass w-full" on:click={login}>
                {$t('session.login.login')}</button
              >
            {/if}
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
