<script lang="ts">
  import { t } from '$lib/translations/config';
  import { Status } from '$lib/constants';
  import { enhance } from '$app/forms';

  export let form;

  let status = Status.WAITING;
  let code = '';
  let msg = '';
  let valid = false;

  const clear = () => {
    if (status !== Status.WAITING) {
      status = Status.WAITING;
      msg = '';
    }
  };

  // $: valid = /^\d+$/.test(code) && code.length == 6;
  const oninput = () => {
    valid = /^\d+$/.test(code) && code.length == 6;
    msg = !valid && code ? $t('session.email_confirmation.code_not_numeric') : '';
  };
</script>

<svelte:head>
  <title>{$t('session.email_confirmation.email_confirmation')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content text-center">
    <div class="max-w-4xl">
      <h1 class="text-5xl font-bold">
        {$t('session.email_confirmation.email_confirmation')}
      </h1>
      <p class="py-6">
        {$t('session.email_confirmation.email_confirmation_text')}
      </p>
      <form
        method="POST"
        class="form-control"
        on:focus={clear}
        use:enhance={() => {
          status = Status.SENDING;

          return async ({ result, update }) => {
            if (result.type === 'failure') {
              status = Status.ERROR;
              msg = $t(`error.${result.data ? result.data['error'] : ''}`);
            } else if (result.type === 'redirect') {
              // await queryClient.invalidateQueries();
            }
            await update();
          };
        }}
      >
        <input
          type="text"
          id="code"
          name="code"
          class="input input-bordered input-lg input-{msg
            ? 'error'
            : valid
            ? 'success'
            : 'info'} mx-auto text-center"
          placeholder={$t('session.email_confirmation.code')}
          bind:value={code}
          on:input={oninput}
        />
        <div class="mt-6">
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={msg}
            data-tip={msg || null}
          >
            <button
              type="submit"
              class="btn {msg ? 'btn-error' : 'btn-accent btn-outline'}"
              disabled={!valid}
              on:click={() => {
                if (form) {
                  form.code = code;
                }
              }}
            >
              {$t(msg ? 'common.error' : 'session.email_confirmation.activate')}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
