<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import ChapterAdmission from '$lib/components/ChapterAdmission.svelte';
  import { getUserPrivilege } from '$lib/utils';
  import Error from '$lib/components/Error.svelte';

  export let data;

  $: ({ user, admitterId, admitteeId, api } = data);

  $: query = createQuery(api.admission.infoChapter({ admitterId, admitteeId }));
</script>

<svelte:head>
  <title>{$t('studio.chapter_admission')} | {$t('common.title')}</title>
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
          {$t('studio.chapter_admission')}
        </span>
        <ChapterAdmission
          {admission}
          editable={user &&
            ((admission.admittee.ownerId === user.id && getUserPrivilege(user.role) >= 3) ||
              (admission.admittee.ownerId !== user.id && getUserPrivilege(user.role) === 6))}
        />
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio/admissions/chapters" />
{:else}
  <div class="min-h-screen skeleton" />
{/if}
