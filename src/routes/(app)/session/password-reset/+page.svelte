<script lang="ts">
  import { t } from '$lib/translations/config';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);
</script>

<svelte:head>
  <title>{$t('session.password_reset.password_reset')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content flex-col text-center sm:w-[50vw] max-w-lg">
    <h1 class="text-5xl font-bold">
      {$t('session.password_reset.password_reset')}
    </h1>
    <p class="py-6">
      {$t('session.password_reset.password_reset_text')}
    </p>
    <form method="POST" class="w-full form-control" use:enhance>
      <div
        class={$errors.Code ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
        data-tip={$errors.Code}
      >
        <input
          id="code"
          name="Code"
          autocomplete="off"
          class="input transition border-2 normal-border hover:input-secondary input-lg w-full text-center"
          placeholder={$t('session.code')}
        />
      </div>
      <div
        class={$errors.Password ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
        data-tip={$errors.Password}
      >
        <input
          type="password"
          id="password"
          name="Password"
          autocomplete="off"
          class="input transition border-2 normal-border hover:input-secondary input-lg mt-4 w-full text-center"
          placeholder={$t('session.password_reset.new_password')}
        />
      </div>
      <div
        class={$errors.ConfirmPassword ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
        data-tip={$errors.ConfirmPassword}
      >
        <input
          type="password"
          id="confirm_password"
          name="ConfirmPassword"
          autocomplete="off"
          class="input transition border-2 normal-border hover:input-secondary input-lg mt-4 w-full text-center"
          placeholder={$t('session.confirm_password')}
        />
      </div>
      <div class="mt-10 join">
        <a
          href="/session/password-reset/request"
          class="btn border-2 normal-border hover:btn-outline join-item w-1/4"
        >
          {$t('common.back')}
        </a>
        <div
          class="tooltip tooltip-bottom tooltip-error w-3/4"
          class:tooltip-open={!!$message}
          data-tip={$message}
        >
          <button
            type="submit"
            class="btn border-2 normal-border {$allErrors.length > 0
              ? 'btn-error'
              : $submitting
                ? 'btn-ghost'
                : 'hover:btn-outline'} w-full join-item"
            disabled={$submitting}
          >
            {$allErrors.length > 0
              ? $t('common.error')
              : $submitting
                ? $t('common.waiting')
                : $t('common.submit')}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>
