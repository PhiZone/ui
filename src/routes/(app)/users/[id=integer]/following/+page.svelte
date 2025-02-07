<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { searchParams, id, page, api } = $derived(data);

  let query = $derived(createQuery(api.user.followees({ id, page })));
</script>

<svelte:head>
  <title>{$t('user.user')} - {$t('user.following')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <h1 class="text-4xl font-bold mb-6">{$t('user.following')}</h1>
    {#if total && perPage && data && data.length > 0}
      <div class="result">
        {#each data as user}
          <div class="w-80">
            <User id={user.id} initUser={user} fixedHeight />
          </div>
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/users" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
