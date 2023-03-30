<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { t } from '$lib/translations/config';

  export let data: import('./$types').PageData;
  $: ({ user } = data);
  onMount(() => {
    if (user.id) {
      goto(`/users/${user.id}`);
    } else {
      goto('/');
    }
  });
</script>

<svelte:head>
  <title>{$t('user.user')} | {$t('common.title')}</title>
</svelte:head>

<div class="w-full" />

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
