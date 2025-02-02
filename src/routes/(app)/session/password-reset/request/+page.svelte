<script lang="ts">
  import { superForm } from 'sveltekit-superforms';

  import { t } from '$lib/translations/config';

  export let data;

  const { form, enhance, message, errors, submitting, allErrors } = superForm(data.form);
</script>

<svelte:head>
  <title>{$t('session.password_reset.password_reset')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content flex-col text-center sm:w-[50vw] max-w-lg">
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
          class="input transition border-2 normal-border input-lg {$errors.Email
            ? 'hover:input-error'
            : 'hover:input-info'} w-full text-center"
        />
        <div
          class="tooltip tooltip-right tooltip-error"
          class:tooltip-open={!!$errors.Email}
          data-tip={$errors.Email}
        ></div>
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
                : 'btn-outline border-2 normal-border'} w-full"
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
