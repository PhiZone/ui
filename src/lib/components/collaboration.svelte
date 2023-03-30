<script lang="ts">
  import { t } from '$lib/translations/config';
  import * as api from '$lib/api';
  import { goto, preloadData } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Collaboration, User } from '$lib/models';
  import UserCard from '$lib/components/user.svelte';
  import { getCompressedImage } from '$lib/utils';

  export let collaboration: Collaboration, token: string | undefined, user: User;

  const getChart = (collaboration: Collaboration) => {
    if (typeof collaboration.chart == 'object') {
      return collaboration.chart;
    }
    return null;
  };

  const getDifficulty = (collaboration: Collaboration) => {
    if (typeof collaboration.chart == 'object') {
      return collaboration.chart.difficulty != 0 ? collaboration.chart.difficulty : '?';
    }
    return '?';
  };

  const getSong = (collaboration: Collaboration) => {
    if (typeof collaboration.chart == 'object') {
      return collaboration.chart.song ? collaboration.chart.song : collaboration.chart.song_upload;
    }
    return null;
  };

  const updateStatus = async (collaboration: Collaboration, attitude: number) => {
    const resp = await api.PATCH(
      `/collaborations/${collaboration.id}/`,
      {
        attitude: attitude,
      },
      token,
      user
    );
    if (resp.ok) {
      window.location.reload();
    } else {
      console.log(await resp.json());
    }
  };
</script>

<div class="card min-w-[500px] card-side overflow-hidden bg-base-100 shadow-lg">
  <figure class="min-w-[30%] max-w-[30%]">
    <img
      class="object-cover w-full h-full"
      src={getCompressedImage(getSong(collaboration)?.illustration)}
      alt="Illustration"
    />
  </figure>
  <div class="card-body w-[70%]">
    <h2 class="card-title text-2xl mb-3 min-w-fit w-20 max-w-[150px] h-1/2">
      {getSong(collaboration)?.name}
      <button class="btn btn-secondary btn-sm text-2xl no-animation">
        {getChart(collaboration)?.level}
        {getDifficulty(collaboration)}
      </button>
    </h2>
    <div class="flex gap-3 justify-between h-1/2 items-center">
      <div class="max-w-fit">
        {#if typeof collaboration.inviter === 'object'}
          <UserCard user={collaboration.inviter} {token} operator={user} mini showButton={false} />
        {:else if typeof collaboration.invitee === 'object'}
          <UserCard user={collaboration.invitee} {token} operator={user} mini showButton={false} />
        {/if}
      </div>
      <button
        class="btn btn-primary btn-outline"
        on:click={() => {
          goto(`/studio/chart-submissions/${getChart(collaboration)?.id}`);
        }}
        on:pointerenter={() => {
          preloadData(`/studio/chart-submissions/${getChart(collaboration)?.id}`);
        }}
      >
        <svg
          fill="currentColor"
          width="25px"
          height="25px"
          viewBox="-5.5 0 32 32"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.52 23.72v0c-1.2 0-2.36-0.48-3.2-1.32-0.84-0.88-1.32-2-1.32-3.2s0.48-2.36 1.32-3.2l4.24-4.24c0.8-0.8 1.88-1.28 3.040-1.32 0.48 0 0.84 0.36 0.88 0.8 0 0.48-0.36 0.84-0.8 0.88-0.72 0.040-1.4 0.32-1.92 0.84l-4.24 4.2c-0.52 0.52-0.84 1.24-0.84 2s0.28 1.48 0.84 2c0.52 0.52 1.24 0.84 2 0.84s1.48-0.28 2-0.84l4.24-4.24c0.52-0.52 0.84-1.24 0.84-2 0-0.48 0.36-0.84 0.84-0.84s0.84 0.36 0.84 0.84c0 1.2-0.48 2.36-1.32 3.2l-4.24 4.24c-0.88 0.88-2 1.36-3.2 1.36zM12 21.56c-0.44 0-0.8-0.36-0.84-0.8 0-0.48 0.32-0.84 0.8-0.88 0.72-0.040 1.4-0.32 1.88-0.84l4.28-4.24c1.12-1.12 1.12-2.92 0-4-1.12-1.12-2.92-1.12-4 0l-4.28 4.24c-0.52 0.52-0.8 1.2-0.84 1.92 0 0.48-0.4 0.8-0.88 0.8s-0.84-0.4-0.8-0.88c0.040-1.16 0.52-2.24 1.32-3.040l4.28-4.24c1.76-1.76 4.64-1.76 6.4 0s1.76 4.64 0 6.4l-4.28 4.24c-0.8 0.8-1.84 1.28-3.040 1.32 0.040 0 0 0 0 0z"
          />
        </svg>
        {$t('common.source')}
      </button>
      {#if collaboration.status === 0}
        {#if !$page.url.searchParams.get('sent') && typeof collaboration.invitee === 'number' && collaboration.invitee === user.id}
          <div class="btn-group">
            <button
              class="btn btn-primary btn-outline"
              on:click={() => {
                updateStatus(collaboration, 1);
              }}>{$t('studio.request.accept')}</button
            >
            <button
              class="btn btn-accent btn-outline"
              on:click={() => {
                updateStatus(collaboration, 2);
              }}>{$t('studio.request.reject')}</button
            >
          </div>
        {/if}
      {:else}
        <button class="btn btn-disabled"
          >{$t(
            collaboration.status === 1 ? 'studio.request.accepted' : 'studio.request.rejected'
          )}</button
        >
      {/if}
    </div>
  </div>
</div>
