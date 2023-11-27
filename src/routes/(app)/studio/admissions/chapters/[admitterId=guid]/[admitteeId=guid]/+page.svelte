<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import ChapterAdmission from '$lib/components/ChapterAdmission.svelte';

  export let data;

  $: ({ admitterId, admitteeId, api } = data);

  $: query = createQuery(api.admission.infoChapter({ admitterId, admitteeId }));
</script>

<svelte:head>
  <title>{$t('studio.chapter_admission')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="form-control mx-auto">
    {#if $query.isSuccess}
      {@const admission = $query.data.data}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('studio.chapter_admission')}
        </span>
        <ChapterAdmission {admission} />
      </div>
    {/if}
  </div>
</div>
