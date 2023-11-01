<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Pagination from '$lib/components/Pagination.svelte';
  import Answer from '$lib/components/Answer.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.pet.listAnswers(searchParams));
</script>

<svelte:head>
  <title>{$t('pet.answers')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('pet.answers')}</h1>
  {#if $query.isSuccess}
    {@const { total, perPage, data } = $query.data}
    {#if total && perPage && data && data.length > 0}
      <div class="flex flex-col">
        {#each data as answer}
          <Answer {answer} />
        {/each}
      </div>
      <Pagination {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  {/if}
</div>
