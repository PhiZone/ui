<script lang="ts">
  // You will see warning in the console, but it's unavoidable
  // see: https://github.com/sveltejs/kit/blob/ed19b648876fabd089672bddb142c3c22b262d8d/packages/kit/src/runtime/app/forms.js#L102
  // `fetch` here is hard coded
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import { SUPPORTED_APPS, Status } from '$lib/constants';
  import { getAvatar, requestIdentity } from '$lib/utils';
  // import { useQueryClient } from '@tanstack/svelte-query';

  export let data, form;
  $: ({ api } = data);

  let status = Status.WAITING;
  let msg = '';
  let appDisabled = '';

  const clear = () => {
    if (status !== Status.WAITING) {
      status = Status.WAITING;
      msg = '';
    }
  };
</script>

<svelte:head>
  <title>{$t('session.login.login')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content form-control lg:flex-row-reverse">
    <div class="px-10 text-center lg:text-left">
      <h1 class="text-5xl font-bold">
        {$t('session.login.login')}
      </h1>
      <p class="py-6">
        {$t('session.login.login_text')}
      </p>
    </div>
    <div
      class="card flex-shrink-0 w-full max-w-sm border-2 normal-border transition hover:shadow-lg bg-base-100"
    >
      <div class="card-body">
        <form
          method="POST"
          class="form-control"
          on:focusin={clear}
          use:enhance={() => {
            status = Status.SENDING;

            return async ({ result, update }) => {
              if (result.type === 'failure') {
                status = Status.ERROR;
                msg = $t(
                  result.status === 400 || result.status === 404
                    ? `session.login.${result.data?.error}`
                    : 'common.unknown_error',
                );
              } else if (result.type === 'redirect') {
                // await queryClient.invalidateQueries();
              }
              await update();
            };
          }}
        >
          <label class="label" for="email">
            <span class="label-text">{$t('session.email')}</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder={$t('session.email')}
            value={form?.email ?? ''}
            autocomplete="username"
            class="input transition border-2 normal-border hover:input-secondary"
          />
          <label class="label" for="password">
            <span class="label-text">{$t('session.password')}</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder={$t('session.password')}
            value={form?.password ?? ''}
            autocomplete="current-password"
            class="input transition border-2 normal-border hover:input-secondary"
          />
          <div class="label flex justify-between">
            <a
              href="/session/password-reset/request{$page.url.search}"
              class="label-text-alt link link-hover"
            >
              {$t('session.login.forgot_password')}
            </a>
            <a href="/session/register{$page.url.search}" class="label-text-alt link link-hover">
              {$t('session.registration.register')}
            </a>
          </div>
          <div class="flex justify-center mt-6">
            <div
              class="tooltip tooltip-bottom tooltip-error w-full"
              class:tooltip-open={status === Status.ERROR}
              data-tip={status === Status.ERROR ? msg : null}
            >
              <button
                type="submit"
                class="btn {status === Status.ERROR
                  ? 'btn-error'
                  : status === Status.SENDING
                    ? 'btn-ghost'
                    : 'btn-outline border-2 normal-border'} w-full"
                disabled={status == Status.SENDING}
              >
                {status === Status.ERROR
                  ? $t('common.error')
                  : status === Status.SENDING
                    ? $t('common.waiting')
                    : $t('session.login.login')}
              </button>
            </div>
          </div>
        </form>
        <div class="divider"></div>
        <div class="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] justify-center gap-2">
          {#each SUPPORTED_APPS as app}
            <button
              class="btn btn-outline border-2 normal-border inline-flex items-center gap-2 w-full"
              disabled={appDisabled === app.name}
              on:click={async () => {
                appDisabled = app.name;
                await requestIdentity(app.name, api);
                appDisabled = '';
              }}
            >
              <div class="w-5 h-5 flex items-center justify-center">
                {#if app.branded}
                  <i class="fa-brands fa-{app.name.toLowerCase()} fa-xl"></i>
                {:else}
                  <div class="avatar">
                    <div class="w-6 rounded-full">
                      <img src={getAvatar(app.avatar)} alt="Avatar" />
                    </div>
                  </div>
                {/if}
              </div>
              <p>{app.name}</p>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
