<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Collaboration from '$lib/components/Collaboration.svelte';
  import { getUserPrivilege } from '$lib/utils';

  export let data;

  $: ({ user, id, api } = data);

  $: query = createQuery(api.collaboration.info({ id }));
</script>

<svelte:head>
  <title>{$t('studio.collaboration')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="w-5/6 form-control mx-auto max-w-[1200px]">
    {#if $query.isSuccess}
      {@const collaboration = $query.data.data}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('studio.collaboration')}
        </span>
        <Collaboration
          {collaboration}
          editable={user &&
            ((collaboration.inviterId === user.id && getUserPrivilege(user.role) >= 3) ||
              (collaboration.inviterId !== user.id && getUserPrivilege(user.role) === 6))}
        />
      </div>
    {/if}
  </div>
</div>
