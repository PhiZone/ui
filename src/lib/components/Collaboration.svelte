<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import type { CollaborationDto } from '$lib/api/collaboration';

  import { page } from '$app/stores';
  import ChartSubmission from '$lib/components/ChartSubmission.svelte';
  import SongSubmission from '$lib/components/SongSubmission.svelte';
  import User from '$lib/components/User.svelte';
  import { t } from '$lib/translations/config';

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
        { op: 'replace', path: '/position', value: position },
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
    class="card overflow-hidden w-full bg-base-200 border-2 normal-border transition hover:shadow-lg"
  >
    <div class="card-body">
      <div class="flex flex-col md:flex-row gap-6 mx-auto">
        {#if $chartSubmission.isSuccess}
          <ChartSubmission chart={$chartSubmission.data.data} />
        {:else if $songSubmission.isSuccess}
          <SongSubmission song={$songSubmission.data.data} />
        {/if}
        <div class="flex flex-col gap-4 w-fit">
          {#if !showInvitee && user && collaboration.inviteeId == user.id}
            <User id={collaboration.inviterId} kind="full" showFollow={false} />
          {:else}
            <User id={collaboration.inviteeId} kind="full" showFollow={false} />
          {/if}
          <div class="flex flex-col gap-4">
            {#if collaboration.position}
              <div
                class={collaboration.position.length > 10 ? 'tooltip tooltip-bottom' : ''}
                data-tip={collaboration.position}
              >
                <label class="join w-full">
                  <span class="btn w-1/4 btn-active cursor-default no-animation join-item">
                    {$t('common.position')}
                  </span>
                  <button
                    class="btn w-3/4 btn-shallow btn-active cursor-default no-animation join-item text-lg"
                  >
                    {collaboration.position.length > 10
                      ? `${collaboration.position.substring(0, 10)}...`
                      : collaboration.position}
                  </button>
                </label>
              </div>
            {/if}
            {#if !disabled && collaboration.status === 0}
              {#if user && collaboration.inviteeId === user.id}
                <div class="join w-80">
                  <button
                    class="btn hover:btn-primary border-2 normal-border btn-outline join-item w-1/2"
                    on:click={() => {
                      review(true);
                    }}
                  >
                    {$t('studio.request.accept')}
                  </button>
                  <button
                    class="btn hover:btn-accent border-2 normal-border btn-outline join-item w-1/2"
                    on:click={() => {
                      review(false);
                    }}
                  >
                    {$t('studio.request.reject')}
                  </button>
                </div>
              {:else}
                <button class="btn btn-disabled w-80">
                  {$t('common.pending')}
                </button>
              {/if}
            {:else}
              <button class="btn btn-disabled w-80">
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
    </div>
  </div>
{:else}
  <div class="flex flex-col md:flex-row gap-3 justify-between items-center">
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
          class="input w-1/2 transition border-2 normal-border hover:input-secondary join-item"
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
          <button class="btn btn-shallow no-animation join-item text-lg w-3/4">
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
              class="btn hover:btn-primary btn-outline border-2 normal-border join-item"
              on:click={() => {
                review(true);
              }}
            >
              {$t('studio.request.accept')}
            </button>
            <button
              class="btn hover:btn-accent btn-outline border-2 normal-border join-item"
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
          <Delete
            id={collaboration.id}
            path="collaborations"
            name="studio.collaboration"
            class="btn-sm btn-square"
          />
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
