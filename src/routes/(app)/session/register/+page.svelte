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
        emailConfirmationResult.message = $t(`error.${error.code}`);
      } else if (error.status === ResponseDtoStatus.ErrorTemporarilyUnavailable) {
        emailConfirmationResult.message = `${$t(`error.${error.code}`)}\n\n${$t(
          'common.date_available',
        )}${$t('common.colon')}${parseDateTime(error.dateAvailable)}`;
      } else if (error.status === ResponseDtoStatus.ErrorWithMessage) {
        emailConfirmationResult.message = error.message;
      } else if (error.status === ResponseDtoStatus.ErrorDetailed) {
        error.errors.forEach(({ field, errors }) => {
          emailConfirmationResult.errors[field] = errors.map((value) => {
            return $t(`error.${value}`);
          });
        });
      }
    }
  };

  let legalAgreement = false;
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

<div class="hero min-h-screen bg-base-300">
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
          <div class="flex">
            <input
              type="username"
              id="username"
              name="UserName"
              placeholder={$t('session.username')}
              bind:value={$form.UserName}
              class="input input-bordered w-full max-w-xs"
            />
            <div
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={$errors.UserName || emailConfirmationResult.errors.UserName}
              data-tip={$errors.UserName ?? emailConfirmationResult.errors.UserName}
            />
          </div>
          <label class="label" for="email">
            <span class="label-text">{$t('session.email')}</span>
          </label>
          <div class="flex">
            <input
              type="email"
              id="email"
              name="Email"
              placeholder={$t('session.email')}
              bind:value={$form.Email}
              {...$constraints.Email}
              autocomplete="username"
              class="input input-bordered w-full max-w-xs"
            />
            <div
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={$errors.Email || emailConfirmationResult.errors.Email}
              data-tip={$errors.Email ?? emailConfirmationResult.errors.Email}
            />
          </div>
          <label class="label" for="password">
            <span class="label-text">{$t('session.password')}</span>
          </label>
          <div class="flex">
            <input
              type="password"
              id="password"
              name="Password"
              placeholder={$t('session.password')}
              bind:value={$form.Password}
              autocomplete="new-password"
              class="input input-bordered w-full max-w-xs"
            />
            <div
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={!!$errors.Password}
              data-tip={$errors.Password}
            />
          </div>
          <label class="label" for="confirm_password">
            <span class="label-text">{$t('session.confirm_password')}</span>
          </label>
          <div class="flex">
            <input
              type="password"
              id="confirm_password"
              name="ConfirmPassword"
              placeholder={$t('session.confirm_password')}
              bind:value={$form.ConfirmPassword}
              {...$constraints.ConfirmPassword}
              autocomplete="new-password"
              class="input input-bordered w-full max-w-xs"
            />
            <div
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={!!$errors.ConfirmPassword}
              data-tip={$errors.ConfirmPassword}
            />
          </div>
          <label class="label" for="language">
            <span class="label-text">{$t('session.registration.select_language')}</span>
          </label>
          <div class="flex">
            <select
              id="language"
              name="Language"
              bind:value={$form.Language}
              {...$constraints.Language}
              on:input={(e) => {
                $locale = e.currentTarget.value;
              }}
              class="select select-bordered w-full max-w-xs"
            >
              {#each $locales as value}
                <option {value}>{$t(`common.lang.${value}`)}</option>
              {/each}
            </select>
            <div
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={$errors.Language || emailConfirmationResult.errors.Language}
              data-tip={$errors.Language ?? emailConfirmationResult.errors.Language}
            />
          </div>
          <label class="label" for="region">
            <span class="label-text">{$t('session.registration.select_region')}</span>
          </label>
          <div class="flex">
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
            <div
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={!!$errors.RegionCode}
              data-tip={$errors.RegionCode}
            />
          </div>
          <label class="label" for="email_confirmation_code">
            <span class="label-text">{$t('session.registration.email_confirmation_code')}</span>
          </label>
          <div class="flex">
            <div class="join w-full">
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
                      : 'hover:btn-secondary btn-outline'} join-item w-full"
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
              class="tooltip tooltip-right tooltip-error"
              class:tooltip-open={!!$errors.EmailConfirmationCode}
              data-tip={$errors.EmailConfirmationCode}
            />
          </div>
          <div class="form-control">
            <label class="flex justify-start gap-2 items-center px-1 py-2">
              <input
                type="checkbox"
                bind:checked={legalAgreement}
                class="checkbox checkbox-secondary"
              />
              <span class="label-text">
                {@html $t('session.registration.legal_agreement', {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  terms_of_service: `<a href='/legal/${$locale}/terms-of-service' target='_blank' class='text-accent hover:underline'>${$t(
                    'common.legal.terms_of_service',
                  )}</a>`,
                  privacy_policy: `<a href='/legal/${$locale}/privacy-policy' target='_blank' class='text-accent hover:underline'>${$t(
                    'common.legal.privacy_policy',
                  )}</a>`,
                })}
              </span>
            </label>
          </div>
          <div class="w-full flex justify-center mt-6">
            <button
              type="submit"
              class="btn {$allErrors.length > 0
                ? 'btn-error'
                : $submitting || emailConfirmationResult.status === Status.ERROR
                  ? 'btn-ghost'
                  : 'btn-outline border-2 border-gray-700'} w-full"
              disabled={!legalAgreement ||
                $submitting ||
                emailConfirmationResult.status === Status.ERROR}
            >
              {$allErrors.length > 0
                ? $t('common.error')
                : $submitting
                  ? $t('common.waiting')
                  : $t('session.registration.register')}
            </button>
            <div
              class="tooltip tooltip-bottom tooltip-error w-full"
              class:tooltip-open={!!$message}
              data-tip={$message}
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</div>
