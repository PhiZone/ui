<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import type { UserDto } from '$lib/api';

  $: ({ api } = $page.data);

  export let user: UserDto;
  export let instantResp = true;

  const queryClient = useQueryClient();

  const follow = async () => {
    if (instantResp) {
      user.followerCount++;
      user.dateFollowed = new Date().toISOString();
    }
    const resp = await api.user.follow({ id: user.id });
    if (resp.ok) {
      await queryClient.invalidateQueries({ queryKey: ['user.info', { id: user.id }] });
    } else {
      if (instantResp) {
        user.followerCount--;
        user.dateFollowed = null;
      }
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
  };

  const unfollow = async () => {
    if (instantResp) {
      user.followerCount--;
      user.dateFollowed = null;
    }
    const resp = await api.user.unfollow({ id: user.id });
    if (resp.ok) {
      await queryClient.invalidateQueries({ queryKey: ['user.info', { id: user.id }] });
    } else {
      if (instantResp) {
        user.followerCount++;
        user.dateFollowed = new Date().toISOString();
      }
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
  };
</script>

{#if !user.dateFollowed}
  <button
    type="button"
    class="w-fit btn btn-outline btn-primary text-sm border-2"
    disabled={!user}
    on:click={follow}
  >
    {$t('user.follow')}
    {user.followerCount}
  </button>
{:else}
  <button
    type="button"
    class="w-fit btn btn-outline btn-ghost text-sm border-2"
    on:click={unfollow}
  >
    {$t('user.unfollow')}
    {user.followerCount}
  </button>
{/if}
