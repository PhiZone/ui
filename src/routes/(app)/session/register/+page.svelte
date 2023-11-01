<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import { locales, locale, t } from '$lib/translations/config';
  import { regions } from '$lib/constants';

  export let data;

  const {
    form,
    enhance: registrationEnhance,
    message,
    errors: registrationErrors,
    constraints,
    submitting: registrationSubmitting,
    allErrors: registrationAllErrors,
  } = superForm(data.registrationForm);

  const {
    enhance: emailConfirmationEnhance,
    errors: emailConfirmationErrors,
    submitting: emailConfirmationSubmitting,
    allErrors: emailConfirmationAllErrors,
  } = superForm(data.emailConfirmationForm);

  $: regionMap = new Map(
    [
      ...regions
        .reduce((map, region) => {
          map.set(region, $t(`region.${region}`));
          return map;
        }, new Map<string, string>())
        .entries(),
    ].sort((a, b) => a[1].localeCompare(b[1], $locale)),
  );

  let regionCode = data.user?.region;
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
          id="confirmEmail"
          action="?/confirmEmail"
          class="hidden"
          use:emailConfirmationEnhance
        >
          <input type="hidden" id="username" name="UserName" bind:value={$form.UserName} />
          <input type="hidden" id="email" name="Email" bind:value={$form.Email} />
          <input type="hidden" id="language" name="Language" bind:value={$form.Language} />
        </form>
        <form
          method="POST"
          id="register"
          action="?/register"
          class="w-full form-control"
          use:registrationEnhance
        >
          <label class="label" for="username">
            <span class="label-text">{$t('session.username')}</span>
          </label>
          <input
            type="username"
            id="username"
            name="UserName"
            placeholder={$t('session.username')}
            bind:value={$form.UserName}
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={$registrationErrors.UserName || $emailConfirmationErrors.UserName}
            data-tip={$registrationErrors.UserName ?? $emailConfirmationErrors.UserName}
          />
          <label class="label" for="email">
            <span class="label-text">{$t('session.email')}</span>
          </label>
          <input
            type="email"
            id="email"
            name="Email"
            placeholder={$t('session.email')}
            bind:value={$form.Email}
            {...$constraints.Email}
            autocomplete="username"
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={$registrationErrors.Email || $emailConfirmationErrors.Email}
            data-tip={$registrationErrors.Email ?? $emailConfirmationErrors.Email}
          />
          <label class="label" for="password">
            <span class="label-text">{$t('session.password')}</span>
          </label>
          <input
            type="password"
            id="password"
            name="Password"
            placeholder={$t('session.password')}
            bind:value={$form.Password}
            autocomplete="new-password"
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$registrationErrors.Password}
            data-tip={$registrationErrors.Password}
          />
          <label class="label" for="confirm_password">
            <span class="label-text">{$t('session.confirm_password')}</span>
          </label>
          <input
            type="password"
            id="confirm_password"
            name="ConfirmPassword"
            placeholder={$t('session.confirm_password')}
            bind:value={$form.ConfirmPassword}
            {...$constraints.ConfirmPassword}
            autocomplete="new-password"
            class="input input-bordered"
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$registrationErrors.ConfirmPassword}
            data-tip={$registrationErrors.ConfirmPassword}
          />
          <label class="label" for="language">
            <span class="label-text">{$t('session.registration.select_language')}</span>
          </label>
          <select
            id="language"
            name="Language"
            bind:value={$form.Language}
            {...$constraints.Language}
            class="select select-bordered w-full max-w-xs"
          >
            {#each $locales as value}
              <option {value}>{$t(`common.lang.${value}`)}</option>
            {/each}
          </select>
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={$registrationErrors.Language || $emailConfirmationErrors.Language}
            data-tip={$registrationErrors.Language ?? $emailConfirmationErrors.Language}
          />
          <label class="label" for="region">
            <span class="label-text">{$t('session.registration.select_region')}</span>
          </label>
          <select
            id="region"
            name="RegionCode"
            bind:value={regionCode}
            {...$constraints.RegionCode}
            class="select select-bordered w-full max-w-xs"
          >
            {#each regionMap as region}
              <option value={region[0]}>{region[1]}</option>
            {/each}
          </select>
          <label class="label" for="email_confirmation_code">
            <span class="label-text">{$t('session.registration.email_confirmation_code')}</span>
          </label>
          <div class="join">
            <input
              type="text"
              id="emailConfirmationCode"
              name="EmailConfirmationCode"
              placeholder={$t('session.registration.email_confirmation_code')}
              bind:value={$form.EmailConfirmationCode}
              class="input input-bordered join-item w-3/5"
            />
            <button
              type="submit"
              class="btn {$emailConfirmationAllErrors.length > 0
                ? 'btn-error'
                : $emailConfirmationSubmitting
                ? 'btn-ghost'
                : 'btn-secondary btn-outline'} join-item w-2/5"
              disabled={$emailConfirmationSubmitting}
              form="confirmEmail"
            >
              {$emailConfirmationAllErrors.length > 0
                ? $t('common.error')
                : $emailConfirmationSubmitting
                ? $t('common.waiting')
                : $t('common.fetch')}
            </button>
          </div>
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$registrationErrors.EmailConfirmationCode}
            data-tip={$registrationErrors.EmailConfirmationCode}
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$registrationErrors.RegionCode}
            data-tip={$registrationErrors.RegionCode}
          />
          <div class="w-full flex justify-center mt-6">
            <div
              class="tooltip tooltip-bottom tooltip-error w-full"
              class:tooltip-open={!!$message}
              data-tip={$message}
            >
              <button
                type="submit"
                class="btn {$registrationAllErrors.length > 0
                  ? 'btn-error'
                  : $registrationSubmitting || $emailConfirmationAllErrors.length > 0
                  ? 'btn-ghost'
                  : 'btn-secondary btn-outline'} w-full"
                disabled={$registrationSubmitting || $emailConfirmationAllErrors.length > 0}
              >
                {$registrationAllErrors.length > 0
                  ? $t('common.error')
                  : $registrationSubmitting
                  ? $t('common.waiting')
                  : $t('session.registration.register')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
