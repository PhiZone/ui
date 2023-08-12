<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import User from '$lib/components/User.svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import SearchOptions from '$lib/components/SearchOptions.svelte';

  export let data;
  $: ({ searchParams, page, api } = data);

  $: query = createQuery(api.user.list(searchParams));
</script>

<svelte:head>
  <title>{$t('common.users')} | {$t('common.title')}</title>
</svelte:head>

<div class="page">
  <h1 class="text-4xl font-bold mb-6">{$t('common.users')}</h1>
  <SearchOptions
    params={searchParams}
    filters={[
      { value: 'id', name: $t('user.id'), options: 'number' },
      { value: 'username', name: $t('user.username'), options: 'text' },
      {
        value: 'gender',
        name: $t('user.gender'),
        options: [
          { value: '0', name: $t('user.gender_0') },
          { value: '1', name: $t('user.gender_1') },
          { value: '2', name: $t('user.gender_2') },
        ],
      },
      { value: 'rks', name: $t('user.rks'), options: 'range' },
      { value: 'exp', name: $t('user.exp'), options: 'range' },
      {
        value: 'language',
        name: $t('user.language'),
        options: [
          { value: 'en', name: $t('common.lang.en') },
          { value: 'zh-CN', name: $t('common.lang.zh-CN') },
          { value: 'zh-TW', name: $t('common.lang.zh-TW') },
          { value: 'ja', name: $t('common.lang.ja') },
        ],
      },
    ]}
    orders={[
      { value: 'id', name: $t('user.id') },
      { value: 'userName', name: $t('user.username') },
      { value: 'rks', name: $t('user.rks') },
      { value: 'experience', name: $t('user.exp') },
    ]}
  />
  {#if $query.isSuccess}
    {@const { data, total } = $query.data}
    {#if data && data.length > 0}
      <div class="result">
        {#each data as user}
          <div class="w-80">
            <User id={user.id} {user} fixedHeight />
          </div>
        {/each}
      </div>
      <Pagination {total} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  {/if}
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
  .result {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    grid-gap: 1.5rem;
    justify-items: center;
  }
</style>
