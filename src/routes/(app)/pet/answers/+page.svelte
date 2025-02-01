<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Paginator from '$lib/components/Paginatior.svelte';
  import Answer from '$lib/components/Answer.svelte';
  import Error from '$lib/components/Error.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.pet.listAnswers(searchParams));
</script>

<svelte:head>
  <title>{$t('pet.answers')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <h1 class="text-4xl font-bold mb-6">{$t('pet.answers')}</h1>
    {#if total && perPage && data && data.length > 0}
      <div class="form-control gap-4">
        {#each data as answer}
          <Answer {answer} />
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/pet" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
