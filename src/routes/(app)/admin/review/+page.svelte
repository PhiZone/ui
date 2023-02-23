<script lang="ts">
  import { t } from '$lib/translations/config';
  import { onDestroy, onMount } from 'svelte';
  import { Status } from '$lib/constants';
  import * as api from '$lib/api';
  import Pagination from '$lib/components/pagination.svelte';
  import type { UserInput } from '$lib/models';
  import UserInputCard from '$lib/components/user_input.svelte';
  export let data: import('./$types').PageData;
  $: ({ status, content, error, user, access_token } = data);

  let pageIndex = 1,
    inputCount: number,
    pageStatus = Status.RETRIEVING,
    inputs: UserInput[],
    previousInputs: string,
    nextInputs: string;

  onMount(() => {
    pageStatus = status;
    if (status === Status.OK) {
      inputs = content.results;
      inputCount = content.count;
      previousInputs = content.previous;
      nextInputs = content.next;
    } else {
      console.log('status:', status);
      console.log('error:', error);
    }
  });

  onDestroy(() => {
    clearInterval(updater);
  });

  let updater = setInterval(async () => {
    if (document.hidden || pageIndex != 1) {
      return;
    }
    const resp = await api.GET('/user_inputs/', access_token, user, fetch);
    if (!resp.ok) {
      throw error(resp.status, resp.statusText);
    }
    pageStatus = Status.RETRIEVING;
    const json = await resp.json();
    inputs = json.results;
    inputCount = json.count;
    pageStatus = Status.OK;
  }, 10000);
</script>

<svelte:head>
  <title>
    {$t('common.admin')} - {$t('admin.user_inputs')} | {$t('common.title')}
  </title>
</svelte:head>

<div class="bg-base-200 min-h-screen">
  <div class="pt-32 flex justify-center">
    <div class="w-3/4 max-w-7xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">
        {$t('admin.user_inputs')}
      </h1>
      <div class="min-w-fit form-control gap-4">
        {#if pageStatus === Status.OK}
          {#if inputs && inputs.length > 0}
            {#each inputs as input}
              <UserInputCard {input} token={access_token} />
            {/each}
            <Pagination
              bind:previous={previousInputs}
              bind:next={nextInputs}
              bind:results={inputs}
              bind:count={inputCount}
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

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
