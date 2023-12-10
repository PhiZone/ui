<script lang="ts">
  import { t } from '$lib/translations/config';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const { form, enhance, message, errors, submitting, allErrors } = superForm(data.form);
</script>

<svelte:head>
  <title>{$t('session.password_reset.password_reset')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content flex-col text-center w-[50vw] max-w-lg">
    <h1 class="text-5xl font-bold">
      {$t('session.password_reset.password_reset')}
    </h1>
    <form method="POST" class="w-full form-control" use:enhance>
      <p class="py-6">
        {$t('session.enter_email')}
      </p>
      <div class="flex">
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
          class="tooltip tooltip-right tooltip-error"
          class:tooltip-open={!!$errors.Email}
          data-tip={$errors.Email}
        />
      </div>
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
                : 'btn-outline border-2 border-gray-700'} w-full"
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
