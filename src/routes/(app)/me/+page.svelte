<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  export let data: import('./$types').PageData;
  $: ({ user } = data);
  onMount(() => {
    goto(`/users/${user.id}`);
  });
</script>

<div class="w-full" />

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
