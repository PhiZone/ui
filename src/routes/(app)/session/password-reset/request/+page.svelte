<script lang="ts">
  import { t } from '$lib/translations/config';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const { form, enhance, message, errors, submitting, allErrors } = superForm(data.form);
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
      <form method="POST" use:enhance>
        <p class="py-6">
          {$t('session.password_reset.password_reset_text_1')}
        </p>
        <input
          type="email"
          id="email"
          name="Email"
          placeholder={$t('session.email')}
          value={$form.Email}
          class="input input-bordered input-lg {$errors.Email
            ? 'input-error'
            : 'input-info'} w-full text-center"
        />
        <div
          class="tooltip tooltip-bottom tooltip-error"
          class:tooltip-open={!!$errors.Email}
          data-tip={$errors.Email}
        />
        <div class="mt-10">
          <div
            class="tooltip tooltip-bottom tooltip-error w-full"
            class:tooltip-open={!!$message}
            data-tip={$message}
          >
            <button
              type="submit"
              class="btn {$allErrors.length > 0
                ? 'btn-error'
                : $submitting
                ? 'btn-ghost'
                : 'btn-secondary btn-outline'} w-full"
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
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
