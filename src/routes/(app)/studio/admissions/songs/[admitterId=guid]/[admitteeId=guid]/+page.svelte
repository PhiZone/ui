<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Error from '$lib/components/Error.svelte';
  import SongAdmission from '$lib/components/SongAdmission.svelte';
  import { t } from '$lib/translations/config';

  let { data } = $props();
  let { admitterId, admitteeId, api } = $derived(data);

  let query = $derived(createQuery(api.admission.infoSong({ admitterId, admitteeId })));
</script>

<svelte:head>
  <title>{$t('studio.song_admission')} | {$t('common.site_name')}</title>
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
          {$t('studio.song_admission')}
        </span>
        <SongAdmission {admission} />
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio/admissions/songs" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
