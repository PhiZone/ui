<script lang="ts">
  import { enhance } from '$app/forms';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  export let data;
  export let form;

  $: ({ token, detail } = data);

  let status = Status.WAITING;
  let msg = '';

  const clear = () => {
    status = Status.WAITING;
    msg = '';
  };
</script>

<svelte:head>
  <title>{$t('session.password_reset.password_reset')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="w-[400px] max-w-7xl">
      {#if !token}
        <h1 class="text-5xl font-bold">
          {$t('session.password_reset.token_missing')}
        </h1>
      {:else if detail}
        <h1 class="text-5xl font-bold">
          {$t('session.password_reset.token_invalid')}
        </h1>
      {:else}
        <h1 class="text-5xl font-bold">
          {$t('session.password_reset.password_reset')}
        </h1>
        <p class="py-6">
          {$t('session.password_reset.password_reset_text3')}
        </p>
        <form
          method="POST"
          on:focus={clear}
          use:enhance={() => {
            status = Status.SENDING;

            return async ({ result, update }) => {
              if (result.type === 'success') {
                status = Status.OK;
              } else if (result.type === 'failure') {
                status = Status.ERROR;
                msg = result.data?.detail ?? $t('common.unknown_error');
              }

              await update();
            };
          }}
        >
          <input type="text" name="token" value={token} hidden />
          <input type="email" autocomplete="username" hidden />
          <div
            class="tooltip tooltip-right tooltip-error w-full"
            class:tooltip-open={form?.password_error}
            data-tip={form?.password_error ?? null}
          >
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              class="input input-bordered input-lg my-2 input-info w-full text-center"
              placeholder={$t('session.password_reset.new_password')}
              value={form?.password ?? ''}
            />
          </div>
          <div
            class="tooltip tooltip-right tooltip-error w-full"
            class:tooltip-open={form?.confirm_password_error}
            data-tip={form?.confirm_password_error ?? null}
          >
            <input
              type="password"
              name="confirm_password"
              autocomplete="new-password"
              class="input input-bordered input-lg my-2 input-info w-full text-center"
              placeholder={$t('session.confirm_password')}
              value={form?.confirm_password ?? ''}
            />
          </div>
          <div class="mt-6">
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
                  : $t('common.submit')}
              </button>
            </div>
          </div>
        </form>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
