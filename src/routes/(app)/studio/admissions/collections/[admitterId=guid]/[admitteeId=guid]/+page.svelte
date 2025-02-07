<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import CollectionAdmission from '$lib/components/CollectionAdmission.svelte';
  import Error from '$lib/components/Error.svelte';
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  let { data } = $props();
  let { user, admitterId, admitteeId, api } = $derived(data);

  let query = $derived(createQuery(api.admission.infoCollection({ admitterId, admitteeId })));
</script>

<svelte:head>
  <title>{$t('studio.collection_admission')} | {$t('common.site_name')}</title>
</svelte:head>

{#if $query.isSuccess}
  {@const admission = $query.data.data}
  <div class="hero min-h-screen bg-base-300">
    <div class="form-control mx-auto">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('studio.collection_admission')}
        </span>
        <CollectionAdmission
          {admission}
          editable={user &&
            ((admission.admittee.ownerId === user.id && getUserPrivilege(user.role) >= 3) ||
              (admission.admittee.ownerId !== user.id && getUserPrivilege(user.role) === 6))}
        />
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio/admissions/collections" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
