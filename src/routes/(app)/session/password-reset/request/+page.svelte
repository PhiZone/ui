<script lang="ts">
  import { enhance } from '$app/forms';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  export let form;

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
      <h1 class="text-5xl font-bold">
        {$t('session.password_reset.password_reset')}
      </h1>
      {#if status !== Status.OK}
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
          <p class="py-6">
            {$t('session.password_reset.password_reset_text1')}
          </p>
          <div
            class="tooltip tooltip-right tooltip-error w-full"
            class:tooltip-open={status === Status.ERROR}
            data-tip={status === Status.ERROR ? msg : null}
          >
            <input
              type="email"
              id="email"
              name="email"
              placeholder={$t('session.email')}
              value={form?.email ?? ''}
              class="input input-bordered input-lg {form?.detail
                ? 'input-error'
                : 'input-info'} w-full text-center"
            />
          </div>
          <div class="mt-6">
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
        </form>
      {:else}
        <p class="py-6">
          {$t('session.password_reset.password_reset_text2')}
        </p>
      {/if}
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
