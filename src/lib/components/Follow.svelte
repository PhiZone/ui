<script lang="ts">
  import { useQueryClient } from '@tanstack/svelte-query';
  import { page } from '$app/stores';
  import { t } from '$lib/translations/config';
  import type { User } from '$lib/models';

  $: ({ api } = $page.data);

  export let id: number;
  export let user: User;

  const queryClient = useQueryClient();
  $: following = api.relation.is_following({ id });

  const follow = async () => {
    const resp = await api.relation.follow({ followee: id });
    if (resp.ok) {
      await queryClient.invalidateQueries({ queryKey: ['user.info', { id }] });
      await queryClient.invalidateQueries({
        queryKey: ['relation.listAll', { followee: id, follower: api._user!.id }],
      });
    } else console.error((await resp.json()).detail);
  };

  const unfollow = async () => {
    const resp = await api.relation.unfollow({ followee: id });
    if (resp.ok) {
      await queryClient.invalidateQueries({ queryKey: ['user.info', { id }] });
      await queryClient.invalidateQueries({
        queryKey: ['relation.listAll', { followee: id, follower: api._user!.id }],
      });
    } else console.error((await resp.json()).detail);
  };
</script>

{#if !$following}
  <button class="w-fit btn btn-outline btn-primary text-sm" disabled={!api._user} on:click={follow}>
    {$t('user.follow')}
    {user.fans}
  </button>
{:else}
  <button class="w-fit btn btn-outline btn-ghost text-sm" on:click={unfollow}>
    {$t('user.unfollow')}
    {user.fans}
  </button>
{/if}
