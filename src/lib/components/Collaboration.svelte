<script lang="ts">
  import { t } from '$lib/translations/config';
  import { page } from '$app/stores';
  import User from '$lib/components/User.svelte';
  import type { CollaborationDto } from '$lib/api/collaboration';
  import { createQuery } from '@tanstack/svelte-query';
  import { getCompressedImage, getLevelColor } from '$lib/utils';
  import Delete from './Delete.svelte';

  export let collaboration: CollaborationDto;
  export let kind: 'mini' | 'full' = 'full';
  export let showInvitee = false;
  export let editable = false;

  $: ({ user, api } = $page.data);

  $: chartSubmission = createQuery(
    api.chart.submission.info(
      { id: collaboration.submissionId },
      { enabled: kind === 'full', retry: 0 },
    ),
  );
  $: song = createQuery(
    api.song.info(
      { id: $chartSubmission.data?.data.songId ?? '' },
      {
        enabled:
          kind === 'full' && $chartSubmission.isSuccess && !!$chartSubmission.data.data.songId,
        retry: 0,
      },
    ),
  );
  $: songSubmission = createQuery(
    api.song.submission.info(
      {
        id: $chartSubmission.data?.data.songSubmissionId ?? collaboration.submissionId,
      },
      { enabled: kind === 'full', retry: 0 },
    ),
  );

  let disabled = false;
  let position = collaboration.position;

  const updatePosition = async () => {
    if (position != collaboration.position) {
      const resp = await api.collaboration.update({ id: collaboration.id }, [
        { op: 'add', path: '/position', value: position },
      ]);
      if (resp.ok) {
        collaboration.position = position;
      }
    }
  };

  const review = async (approve: boolean) => {
    disabled = true;
    const resp = await api.collaboration.review({
      id: collaboration.id,
      approve,
    });
    disabled = false;
    if (resp.ok) {
      collaboration.status = approve ? 1 : 2;
    }
  };
</script>

{#if kind === 'full'}
  <div
    class="card card-side overflow-hidden bg-base-100 border-2 border-gray-700 transition hover:shadow-lg"
  >
    {#if $song.isSuccess || $songSubmission.isSuccess}
      {@const submission = $chartSubmission.isSuccess
        ? $chartSubmission.data.data
        : $songSubmission.data?.data}
      {@const song = $song.isSuccess ? $song.data.data : $songSubmission.data?.data}
      <figure class="min-w-[30%] max-w-[30%]">
        <img
          class="object-cover w-full h-full"
          src={getCompressedImage(submission?.illustration ?? song?.illustration)}
          alt="Illustration"
        />
      </figure>
      <div class="card-body w-[70%]">
        <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
          <h2 class="card-title text-2xl content inline-block">
            {song?.title}
          </h2>
          {#if $chartSubmission.isSuccess}
            {@const chart = $chartSubmission.data.data}
            <div class="join join-vertical md:join-horizontal min-w-fit ml-2">
              <button
                class="btn {getLevelColor(chart.levelType)} btn-sm join-item text-xl no-animation"
              >
                {chart.level}
                {chart.difficulty != 0 ? Math.floor(chart.difficulty) : '?'}
              </button>
              {#if chart.isRanked}
                <button class="btn btn-success btn-sm join-item text-xl no-animation">
                  {$t('chart.ranked')}
                </button>
              {/if}
            </div>
          {/if}
        </div>
        <div class="flex flex-wrap gap-2 justify-between items-center">
          <div class="max-w-fit">
            {#if !showInvitee && user && collaboration.inviteeId == user.id}
              <User id={collaboration.inviterId} kind="mini" showFollow={false} />
            {:else}
              <User id={collaboration.inviteeId} kind="mini" showFollow={false} />
            {/if}
          </div>
          {#if editable && collaboration.status === 0}
            <label class="join">
              <span class="btn no-animation join-item">
                {$t('common.position')}
              </span>
              <input
                type="text"
                placeholder={$t('common.position')}
                class="input transition border-2 border-gray-700 hover:input-secondary join-item"
                bind:value={position}
              />
              <button
                class="btn btn-secondary join-item"
                class:btn-disabled={(!collaboration.position && !position) ||
                  position == collaboration.position}
                on:click={updatePosition}
              >
                {$t('common.submit')}
              </button>
            </label>
          {:else if collaboration.position}
            <div
              class={collaboration.position.length > 8 ? 'tooltip tooltip-bottom' : ''}
              data-tip={collaboration.position}
            >
              <label class="join">
                <span class="btn no-animation join-item">
                  {$t('common.position')}
                </span>
                <button class="btn btn-neutral no-animation join-item text-xl">
                  {collaboration.position.length > 8
                    ? `${collaboration.position.substring(0, 8)}...`
                    : collaboration.position}
                </button>
              </label>
            </div>
          {/if}
          <div class="flex flex-col md:flex-row gap-2">
            <a
              href="/studio/{$chartSubmission.isSuccess
                ? 'chart'
                : 'song'}-submissions/{collaboration.submissionId}"
              class="btn border-2 hover:btn-outline min-w-fit"
            >
              <i class="fa-solid fa-link"></i>
              {$t('common.source')}
            </a>
            {#if !disabled && collaboration.status === 0}
              {#if user && collaboration.inviteeId === user.id}
                <div class="join">
                  <button
                    class="btn btn-primary border-2 btn-outline join-item"
                    on:click={() => {
                      review(true);
                    }}
                  >
                    {$t('studio.request.accept')}
                  </button>
                  <button
                    class="btn btn-accent border-2 btn-outline join-item"
                    on:click={() => {
                      review(false);
                    }}
                  >
                    {$t('studio.request.reject')}
                  </button>
                </div>
              {:else}
                <button class="btn btn-disabled">
                  {$t('common.pending')}
                </button>
              {/if}
            {:else}
              <button class="btn btn-disabled">
                {$t(
                  collaboration.status === 1
                    ? 'studio.request.accepted'
                    : !disabled
                      ? 'studio.request.rejected'
                      : 'common.waiting',
                )}
              </button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
{:else}
  <div class="flex flex-col md:flex-row gap-3 items-center">
    <div class="w-full md:w-1/3">
      {#if !showInvitee && user && collaboration.inviteeId == user.id}
        <User id={collaboration.inviterId} kind="mini" showFollow={false} />
      {:else}
        <User id={collaboration.inviteeId} kind="mini" showFollow={false} />
      {/if}
    </div>
    {#if editable && collaboration.status === 0}
      <label class="join w-full md:w-1/2">
        <span class="btn no-animation join-item w-1/4">
          {$t('common.position')}
        </span>
        <input
          type="text"
          placeholder={$t('common.position')}
          class="input w-1/2 transition border-2 border-gray-700 hover:input-secondary join-item"
          bind:value={position}
        />
        <button
          class="btn btn-secondary join-item w-1/4"
          class:btn-disabled={(!collaboration.position && !position) ||
            position == collaboration.position}
          on:click={updatePosition}
        >
          {$t('common.submit')}
        </button>
      </label>
    {:else if collaboration.position}
      <div
        class={collaboration.position.length > 10
          ? 'tooltip tooltip-bottom w-full md:w-1/2'
          : 'w-full md:w-1/2'}
        data-tip={collaboration.position}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4">
            {$t('common.position')}
          </span>
          <button class="btn btn-neutral no-animation join-item text-lg w-3/4">
            {collaboration.position.length > 10
              ? `${collaboration.position.substring(0, 10)}...`
              : collaboration.position}
          </button>
        </label>
      </div>
    {/if}
    {#if !disabled && collaboration.status === 0}
      <div class="flex gap-1 items-center justify-end w-full md:w-1/6 min-w-fit">
        {#if user && collaboration.inviteeId === user.id}
          <div class="join min-w-fit">
            <button
              class="btn btn-primary btn-outline border-2 join-item"
              on:click={() => {
                review(true);
              }}
            >
              {$t('studio.request.accept')}
            </button>
            <button
              class="btn btn-accent btn-outline border-2 join-item"
              on:click={() => {
                review(false);
              }}
            >
              {$t('studio.request.reject')}
            </button>
          </div>
        {:else}
          <button class="btn btn-disabled">
            {$t('common.pending')}
          </button>
        {/if}
        {#if editable}
          <Delete target={collaboration} class="btn-sm btn-square" />
        {/if}
      </div>
    {:else}
      <div class="flex justify-end w-full md:w-1/6 min-w-fit">
        <button class="btn btn-disabled">
          {$t(
            collaboration.status === 1
              ? 'studio.request.accepted'
              : !disabled
                ? 'studio.request.rejected'
                : 'common.waiting',
          )}
        </button>
      </div>
    {/if}
  </div>
{/if}
