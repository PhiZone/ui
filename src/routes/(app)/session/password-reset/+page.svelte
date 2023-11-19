<script lang="ts">
  import { t } from '$lib/translations/config';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);
</script>

<svelte:head>
  <title>{$t('session.password_reset.password_reset')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="hero-content flex-col text-center w-[50vw] max-w-lg">
    <h1 class="text-5xl font-bold">
      {$t('session.password_reset.password_reset')}
    </h1>
    <p class="py-6">
      {$t('session.password_reset.password_reset_text')}
    </p>
    <form method="POST" class="w-full form-control" use:enhance>
      <input
        id="code"
        name="Code"
        autocomplete="off"
        class="input input-bordered input-lg input-info w-full text-center"
        placeholder={$t('session.code')}
      />
      <div
        class="tooltip tooltip-bottom tooltip-error"
        class:tooltip-open={!!$errors.Code}
        data-tip={$t(($errors.Code ?? [])[0])}
      />
      <input
        type="password"
        id="password"
        name="Password"
        autocomplete="off"
        class="input input-bordered input-lg mt-4 input-info w-full text-center"
        placeholder={$t('session.password_reset.new_password')}
      />
      <div
        class="tooltip tooltip-bottom tooltip-error"
        class:tooltip-open={!!$errors.Password}
        data-tip={$t(($errors.Password ?? [])[0])}
      />
      <input
        type="password"
        id="confirm_password"
        name="ConfirmPassword"
        autocomplete="off"
        class="input input-bordered input-lg mt-4 input-info w-full text-center"
        placeholder={$t('session.confirm_password')}
      />
      <div
        class="tooltip tooltip-bottom tooltip-error"
        class:tooltip-open={!!$errors.ConfirmPassword}
        data-tip={$t(($errors.ConfirmPassword ?? [])[0])}
      />
      <div class="mt-10 join">
        <a
          href="/session/password-reset/request"
          class="btn btn-secondary btn-outline join-item w-1/4"
        >
          {$t('common.back')}
        </a>
        <div
          class="tooltip tooltip-bottom tooltip-error w-3/4"
          class:tooltip-open={!!$message}
          data-tip={$t($message)}
        >
          <button
            type="submit"
            class="btn {$allErrors.length > 0
              ? 'btn-error'
              : $submitting
              ? 'btn-ghost'
              : 'btn-primary btn-outline'} w-full join-item"
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
