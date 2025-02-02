<script lang="ts">
  import { superForm } from 'sveltekit-superforms';
  import { locales, locale, t } from '$lib/translations/config';
  import { SUPPORTED_APPS } from '$lib/constants';
  import { REGIONS } from '$lib/constants';

  export let data;
  $: ({ provider, register } = data);

  const { form, enhance, message, errors, constraints, submitting, allErrors } = superForm(
    data.form,
  );

  $: regionMap = new Map(
    [
      ...REGIONS.reduce((map, region) => {
        map.set(region, $t(`region.${region}`));
        return map;
      }, new Map<string, string>()).entries(),
    ].sort((a, b) => a[1].localeCompare(b[1], $locale)),
  );

  let regionCode = data.user?.region;
</script>

<svelte:head>
  <title>
    {$t(register ? 'session.registration.register' : 'session.redirecting', {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      provider: SUPPORTED_APPS.find((app) => app.name.toLowerCase() === provider.toLowerCase())
        .name,
    })} | {$t('common.site_name')}
  </title>
</svelte:head>

{#if register}
  <div class="hero min-h-screen bg-base-300">
    <div class="hero-content form-control lg:flex-row-reverse">
      <div class="px-10 text-center lg:text-left">
        <h1 class="text-5xl font-bold">
          {$t('session.registration.register_with_provider', {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            provider: SUPPORTED_APPS.find(
              (app) => app.name.toLowerCase() === provider.toLowerCase(),
            ).name,
          })}
        </h1>
        <p class="py-6">
          {$t('session.registration.registration_text')}
        </p>
      </div>
      <div
        class="card flex-shrink-0 max-w-[80vw] w-96 border-2 normal-border transition hover:shadow-lg bg-base-100"
      >
        <div class="card-body">
          <form method="POST" class="w-full form-control" use:enhance>
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
                class="select transition border-2 normal-border hover:select-secondary w-full max-w-xs"
              >
                {#each $locales as value}
                  <option {value}>
                    {$t(`common.lang.${value}`)}
                    {#if $locale !== value}
                      - {$t(`lang.${value}`)}
                    {/if}
                  </option>
                {/each}
              </select>
              <div
                class="tooltip tooltip-right tooltip-error"
                class:tooltip-open={$errors.Language}
                data-tip={$errors.Language}
              ></div>
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
                class="select transition border-2 normal-border hover:select-secondary w-full max-w-xs"
              >
                {#each regionMap as region}
                  <option value={region[0]}>{region[1]}</option>
                {/each}
              </select>
              <div
                class="tooltip tooltip-right tooltip-error"
                class:tooltip-open={!!$errors.RegionCode}
                data-tip={$errors.RegionCode}
              ></div>
            </div>
            <div class="w-full flex flex-col justify-center mt-6">
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
                    : $t('session.registration.register')}
              </button>
              <div
                class="tooltip tooltip-bottom tooltip-error w-full"
                class:tooltip-open={!!$message}
                data-tip={$message}
              ></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="hero min-h-screen bg-base-300">
    <div class="hero-content text-center">
      <div class="max-w-md">
        <h1 class="text-5xl font-bold my-4">{$t('session.redirecting')}</h1>
        <p class="text-lg py-6">{$t('session.redirection_description')}</p>
      </div>
    </div>
  </div>
{/if}
