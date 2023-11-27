<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import SongAdmission from '$lib/components/SongAdmission.svelte';

  export let data;

  $: ({ admitterId, admitteeId, api } = data);

  $: query = createQuery(api.admission.infoSong({ admitterId, admitteeId }));
</script>

<svelte:head>
  <title>{$t('studio.song_admission')} | {$t('common.title')}</title>
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
          {$t('studio.song_admission')}
        </span>
        <SongAdmission {admission} />
      </div>
    {/if}
  </div>
</div>
