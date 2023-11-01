<script lang="ts">
  // You will see warning in the console, but it's unavoidable
  // see: https://github.com/sveltejs/kit/blob/ed19b648876fabd089672bddb142c3c22b262d8d/packages/kit/src/runtime/app/forms.js#L102
  // `fetch` here is hard coded
  import { enhance } from '$app/forms';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import { Status } from '$lib/constants';
  // import { useQueryClient } from '@tanstack/svelte-query';

  let status = Status.WAITING;
  let msg = '';

  const clear = () => {
    if (status !== Status.WAITING) {
      status = Status.WAITING;
      msg = '';
    }
  };

  export let form;

  // const queryClient = useQueryClient();
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
                  result.status == 400 || result.status == 404
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
            class="input input-bordered"
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
            class="input input-bordered"
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
                  : 'btn-secondary btn-outline'} w-full"
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
      </div>
    </div>
  </div>
</div>
