<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Pagination from '$lib/components/Pagination.svelte';
  import Submission from '$lib/components/chart_submission.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.song.submission.list(searchParams));
</script>

<svelte:head>
  <title>
    {$t('common.studio')} - {$t('studio.chart_submission')} | {$t('common.title')}
  </title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-4xl font-bold">
          {$t('studio.chart_submissions')}
        </h1>
        <div class="flex justify-between gap-3">
          <label for="list-options" class="btn btn-secondary text-lg btn-xl btn-outline glass">
            {$t('common.list_options')}
          </label>
          <a
            href="/studio/chart-submissions/new"
            class="btn btn-accent text-lg btn-xl btn-outline glass"
          >
            {$t('studio.upload_chart')}
          </a>
        </div>
      </div>
      <div class="min-w-fit form-control gap-4">
        {#if pageStatus === Status.OK && submissions}
          {#if submissions.length > 0}
            {#each submissions as submission}
              <Submission {submission} {user} />
            {/each}
            <Pagination
              bind:previous={previousSubmissions}
              bind:next={nextSubmissions}
              bind:results={submissions}
              bind:count={submissionCount}
              bind:pageIndex
              bind:status={pageStatus}
              token={access_token}
              {user}
            />
          {:else}
            <p class="py-3 text-center">{$t('common.empty')}</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</div>
