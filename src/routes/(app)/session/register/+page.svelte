<script lang="ts">
  import { superForm } from 'sveltekit-superforms/client';
  import { locales, locale, t } from '$lib/translations/config';
  import { Status, regions } from '$lib/constants';
  import { SendEmailMode } from '$lib/api/auth';
  import { ResponseDtoStatus } from '$lib/api/types';
  import { parseDateTime } from '$lib/utils';

  export let data;

  const {
    form,
    enhance: enhance,
    message: message,
    errors: errors,
    constraints,
    submitting: submitting,
    allErrors: allErrors,
  } = superForm(data.form);

  let emailConfirmationResult: {
    status?: Status;
    message?: string;
    errors: { [id: string]: string[] | undefined };
  } = {
    errors: {},
  };

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

  let min = 0,
    sec = 54,
    emailConfirmationAvailable = true,
    emailConfirmationTimer: NodeJS.Timeout,
    emailConfirmationModal = false;

  const confirmEmail = async () => {
    emailConfirmationResult = {
      status: Status.SENDING,
      errors: {},
    };
    const resp = await data.api.auth.sendEmail({
      Email: $form.Email,
      UserName: $form.UserName,
      Language: $form.Language,
      Mode: SendEmailMode.EmailConfirmation,
    });
    if (resp.ok) {
      emailConfirmationResult = {
        status: Status.OK,
        errors: {},
      };
      emailConfirmationModal = true;
      emailConfirmationAvailable = false;
      min = 4;
      sec = 59;
      emailConfirmationTimer = setInterval(() => {
        if (sec == 0) {
          if (min == 0) {
            clearInterval(emailConfirmationTimer);
            emailConfirmationAvailable = true;
          } else {
            min--;
            sec = 59;
          }
        } else {
          sec--;
        }
      }, 1000);
    } else {
      const error = await resp.json();
      emailConfirmationResult = {
        status: Status.ERROR,
        errors: {},
      };
      if (error.status === ResponseDtoStatus.ErrorBrief) {
        emailConfirmationResult.message = t.get(`error.${error.code}`);
      } else if (error.status === ResponseDtoStatus.ErrorTemporarilyUnavailable) {
        emailConfirmationResult.message = `${t.get(`error.${error.code}`)}\n\n${t.get(
          'common.date_available',
        )}${t.get('common.colon')}${parseDateTime(error.dateAvailable)}`;
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        emailConfirmationResult.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        error.errors.forEach(({ field, errors }) => {
          emailConfirmationResult.errors[field] = errors.map((value) => {
            return t.get(`error.${value}`);
          });
        });
      }
    }
  };
</script>

<svelte:head>
  <title>{$t('session.registration.register')} | {$t('common.title')}</title>
</svelte:head>

<input
  type="checkbox"
  id="email-confirmation"
  class="modal-toggle"
  bind:checked={emailConfirmationModal}
/>
<div class="modal">
  <div class="modal-box">
    <h3 class="font-bold text-lg">{$t('session.email_confirmation.email_confirmation')}</h3>
    <p class="py-4">{$t('session.email_confirmation.email_confirmation_text')}</p>
    <div class="modal-action">
      <label for="email-confirmation" class="btn btn-success btn-outline">
        {$t('common.confirm')}
      </label>
    </div>
  </div>
</div>

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
    <div
      class="card flex-shrink-0 max-w-[80vw] w-96 border-2 border-gray-700 transition hover:shadow-lg bg-base-100"
    >
      <div class="card-body">
        <form method="POST" class="w-full form-control" use:enhance>
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
            class:tooltip-open={$errors.UserName || emailConfirmationResult.errors.UserName}
            data-tip={$errors.UserName ?? emailConfirmationResult.errors.UserName}
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
            class:tooltip-open={$errors.Email || emailConfirmationResult.errors.Email}
            data-tip={$errors.Email ?? emailConfirmationResult.errors.Email}
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
            class:tooltip-open={!!$errors.Password}
            data-tip={$errors.Password}
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
            class:tooltip-open={!!$errors.ConfirmPassword}
            data-tip={$errors.ConfirmPassword}
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
            class:tooltip-open={$errors.Language || emailConfirmationResult.errors.Language}
            data-tip={$errors.Language ?? emailConfirmationResult.errors.Language}
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
            <div
              class="tooltip tooltip-bottom tooltip-error w-2/5"
              class:tooltip-open={!!emailConfirmationResult.message}
              data-tip={emailConfirmationResult.message}
            >
              <button
                type="submit"
                class="btn {emailConfirmationResult.status === Status.ERROR
                  ? 'btn-error'
                  : emailConfirmationResult.status === Status.SENDING
                  ? !emailConfirmationAvailable
                    ? 'btn-ghost font-mono'
                    : 'btn-ghost'
                  : 'btn-secondary btn-outline'} join-item w-full"
                disabled={emailConfirmationResult.status === Status.SENDING ||
                  !emailConfirmationAvailable}
                on:click={confirmEmail}
              >
                {!emailConfirmationAvailable
                  ? `${min}m ${sec}s`
                  : emailConfirmationResult.status === Status.ERROR
                  ? $t('common.error')
                  : emailConfirmationResult.status === Status.SENDING
                  ? $t('common.waiting')
                  : $t('common.fetch')}
              </button>
            </div>
          </div>
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$errors.EmailConfirmationCode}
            data-tip={$errors.EmailConfirmationCode}
          />
          <div
            class="tooltip tooltip-bottom tooltip-error"
            class:tooltip-open={!!$errors.RegionCode}
            data-tip={$errors.RegionCode}
          />
          <div class="w-full flex justify-center mt-6">
            <div
              class="tooltip tooltip-bottom tooltip-error w-full"
              class:tooltip-open={!!$message}
              data-tip={$message}
            >
              <button
                type="submit"
                class="btn {$allErrors.length > 0
                  ? 'btn-error'
                  : $submitting || emailConfirmationResult.status === Status.ERROR
                  ? 'btn-ghost'
                  : 'btn-secondary btn-outline'} w-full"
                disabled={$submitting || emailConfirmationResult.status === Status.ERROR}
              >
                {$allErrors.length > 0
                  ? $t('common.error')
                  : $submitting
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
