<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Collaboration from '$lib/components/Collaboration.svelte';
  import Error from '$lib/components/Error.svelte';
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  let { data } = $props();
  let { user, id, api } = $derived(data);

  let query = $derived(createQuery(api.collaboration.info({ id })));
</script>

<svelte:head>
  <title>{$t('studio.collaboration')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const collaboration = $query.data.data}
  <div class="hero min-h-screen bg-base-300">
    <div class="w-5/6 form-control mx-auto max-w-[1200px]">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
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
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio/collaborations" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
