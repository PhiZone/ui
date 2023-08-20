<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import type { UserDto } from '$lib/api';

  $: ({ api } = $page.data);

  export let user: UserDto;

  const queryClient = useQueryClient();

  const follow = async () => {
    const resp = await api.user.follow({ id: user.id });
    if (resp.ok) {
      await queryClient.invalidateQueries({ queryKey: ['user.info', { id: user.id }] });
      // await queryClient.invalidateQueries({
      //   queryKey: ['relation.listAll', { followee: id, follower: api._user!.id }],
      // });
    } else console.error(await resp.json());
  };

  const unfollow = async () => {
    const resp = await api.user.unfollow({ id: user.id });
    if (resp.ok) {
      await queryClient.invalidateQueries({ queryKey: ['user.info', { id: user.id }] });
      // await queryClient.invalidateQueries({
      //   queryKey: ['relation.listAll', { followee: user.id, follower: api._user!.id }],
      // });
    } else console.error(await resp.json());
  };
</script>

{#if !user.dateFollowed}
  <button class="w-fit btn btn-outline btn-primary text-sm" disabled={!api._user} on:click={follow}>
    {$t('user.follow')}
    {user.followerCount}
  </button>
{:else}
  <button class="w-fit btn btn-outline btn-ghost text-sm" on:click={unfollow}>
    {$t('user.unfollow')}
    {user.followerCount}
  </button>
{/if}
