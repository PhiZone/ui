<script lang="ts">
  import type { ResponseDtoError } from '$lib/api/types';

  import { page } from '$app/state';
  import { t } from '$lib/translations/config';

  interface Props {
    error: ResponseDtoError;
    back?: string;
  }
  let { error, back = '/' }: Props = $props();

  let showMsg = [400, 401, 403, 404, 500, 502].includes(error.httpStatus);
</script>

<svelte:head>
  <title>
    {error.httpStatus} | {$t('common.site_name')}
  </title>
</svelte:head>

<div
  class="hero bg-base-300 {page.url.pathname.startsWith('/studio')
    ? 'min-h-screen'
    : 'page-height'}"
>
  <div class="hero-content text-center">
    <div class="max-w-4xl form-control gap-4">
      <h1 class="text-6xl sm:text-8xl font-bold">{error.httpStatus}</h1>
      {#if error.code || showMsg}
        <p class="text-xl sm:text-2xl">
          {error.code ? $t(`error.${error.code}`) : $t(`common.errors.${error.httpStatus}`)}
        </p>
      {/if}
      {#if error.message}
        <p class="sm:text-lg">{$t('common.error_msg')}{error.message}</p>
      {/if}
      <a href={back} class="btn border-2 normal-border btn-outline btn-lg m-2">
        {back == '/' ? $t('common.back_to_homepage') : $t('common.back')}
      </a>
    </div>
  </div>
</div>

<style>
  .page-height {
    min-height: calc(100vh - 219px);
  }
</style>
