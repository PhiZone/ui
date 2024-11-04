<script lang="ts">
  import { t } from '$lib/translations/config';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);
</script>

<svelte:head>
  <title>{$t('user.account_inheritance.title')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content flex-col text-center sm:w-[50vw] max-w-lg">
    <h1 class="text-5xl font-bold pb-6">
      {$t('user.account_inheritance.title')}
    </h1>
    <form method="POST" class="w-full form-control" use:enhance>
      <div
        class={$errors.code ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
        data-tip={$errors.code}
      >
        <input
          id="code"
          name="code"
          autocomplete="off"
          class="input transition border-2 normal-border hover:input-secondary input-lg w-full text-center"
          placeholder={$t('user.account_inheritance.code')}
        />
      </div>
      <div
        class="tooltip tooltip-bottom tooltip-error mt-10"
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
    </form>
  </div>
</div>
