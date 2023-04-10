<script lang="ts">
  import { locales, t } from '$lib/translations/config';
  import { Status } from '$lib/constants';
  import type { ActionData } from './$types';
  import { enhance } from '$app/forms';

  let status = Status.WAITING;
  let msg = '';

  const clear = () => {
    if (status !== Status.WAITING) {
      status = Status.WAITING;
      msg = '';
    }
  };

  export let form: ActionData;
</script>

<svelte:head>
  <title>{$t('session.registration.register')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content form-control lg:flex-row-reverse">
    <div class="px-10 text-center lg:text-left">
      <h1 class="text-5xl font-bold">
        {$t('session.registration.register')}
      </h1>
      <p class="py-6">
        {$t('session.registration.registration_text')}
      </p>
    </div>
    <div class="card flex-shrink-0 w-full max-w-sm shadow-lg bg-base-100">
      <div class="card-body">
        <form
          method="POST"
          class="w-full form-control"
          on:focusin={clear}
          use:enhance={() => {
            status = Status.SENDING;

            return async ({ result, update }) => {
              if (result.type === 'failure') {
                status = Status.ERROR;
                msg = result.data?.detail ?? $t('common.correct_errors');
              }
              await update();
            };
          }}
        >
          <label class="label" for="username">
            <span class="label-text">{$t('session.username')}</span>
          </label>
          <input
            type="username"
            id="username"
            name="username"
            placeholder={$t('session.username')}
            value={form?.username ?? ''}
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={form?.username_error}
            data-tip={form?.username_error || null}
          />
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
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={form?.email_error}
            data-tip={form?.email_error || null}
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
            autocomplete="new-password"
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={form?.password_error}
            data-tip={form?.password_error || null}
          />
          <label class="label" for="confirm_password">
            <span class="label-text">{$t('session.confirm_password')}</span>
          </label>
          <input
            type="password"
            id="confirm_password"
            name="confirm_password"
            placeholder={$t('session.confirm_password')}
            value={form?.confirm_password ?? ''}
            autocomplete="new-password"
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={form?.confirm_password_error}
            data-tip={form?.confirm_password_error || null}
          />
          <label class="label" for="language">
            <span class="label-text">{$t('session.registration.select_language')}</span>
          </label>
          <select id="language" name="language" class="select select-bordered w-full max-w-xs">
            {#each $locales as value}
              <option {value}>{$t(`lang.${value}`)}</option>
            {/each}
          </select>
          <div class="w-full flex justify-center mt-6">
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
                {$t(
                  status === Status.ERROR
                    ? 'common.error'
                    : status === Status.SENDING
                    ? 'common.waiting'
                    : 'session.registration.register'
                )}
              </button>
            </div>
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
