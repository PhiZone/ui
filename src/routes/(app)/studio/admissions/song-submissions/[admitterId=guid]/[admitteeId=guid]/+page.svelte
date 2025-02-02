<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Error from '$lib/components/Error.svelte';
  import SongSubmissionAdmission from '$lib/components/SongSubmissionAdmission.svelte';
  import { t } from '$lib/translations/config';

  export let data;

  $: ({ admitterId, admitteeId, api } = data);

  $: query = createQuery(api.admission.infoSongSubmission({ admitterId, admitteeId }));
</script>

<svelte:head>
  <title>{$t('studio.song_submission_admission')} | {$t('common.site_name')}</title>
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
          {$t('studio.song_submission_admission')}
        </span>
        <SongSubmissionAdmission {admission} />
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/studio/admissions/song-submissions" />
{:else}
  <div class="min-h-screen skeleton"></div>
{/if}
