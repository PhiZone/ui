<script lang="ts">
  import { t } from '$lib/translations/config';
  import { range } from '$lib/utils';
  import { superForm } from 'sveltekit-superforms';
  import { createQuery } from '@tanstack/svelte-query';

  export let data;

  $: ({ api, divisionId, name } = data);

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  let claimedParticipantCount: number | null = null;
  let claimedSubmissionCount: number | null = null;

  $: division = createQuery(api.event.division.info({ id: divisionId }));

  $: if (claimedParticipantCount === null && $division.isSuccess) {
    claimedParticipantCount =
      $division.data.data.minParticipantPerTeamCount ??
      $division.data.data.maxParticipantPerTeamCount ??
      1;
  }

  $: if (claimedSubmissionCount === null && $division.isSuccess) {
    claimedSubmissionCount =
      $division.data.data.minSubmissionCount ?? $division.data.data.maxSubmissionCount ?? 1;
  }
</script>

<svelte:head>
  <title>{$t('event.division.create_team')} | {$t('event.event')} | {$t('common.site_name')}</title>
</svelte:head>

<div class="bg-base-300 min-h-screen">
  <div class="pt-32 pb-4 flex justify-center">
    <div class="w-3/4 max-w-6xl min-w-20">
      <h1 class="text-4xl font-bold mb-6">{$t('event.division.create_team')}</h1>
      <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
        <div class="card-body">
          <form method="POST" class="w-full form-control" enctype="multipart/form-data" use:enhance>
            <input type="text" id="division_id" name="DivisionId" value={divisionId} hidden />
            <div class="flex items-center my-2">
              <span class="w-32">{$t('event.team.icon')}</span>
              <input
                type="file"
                id="icon"
                name="Icon"
                accept=".jpg, .jpeg, .png, .webp"
                class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                  $errors.Icon
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
              />
              {#if !!$errors.Icon}
                <span class="w-2/3 text-error">{$errors.Icon}</span>
              {:else}
                <span class="w-2/3">{$t('common.form.tips.image')}</span>
              {/if}
            </div>
            <div
              class={$errors.Name ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Name ? $errors.Name : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('event.team.name')}
                </span>
                <input
                  id="name"
                  name="Name"
                  class={`input transition border-2 normal-border join-item ${
                    $errors.Name ? 'hover:input-error' : 'hover:input-secondary'
                  } w-3/4`}
                  value={name}
                />
              </label>
            </div>
            <div
              class={$errors.ClaimedParticipantCount
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.ClaimedParticipantCount ? $errors.ClaimedParticipantCount : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('event.team.claimed_participant_count')}
                </span>
                {#if $division.data?.data.maxParticipantPerTeamCount && $division.data?.data.maxParticipantPerTeamCount <= 200}
                  <select
                    id="claimed_participant_count"
                    name="ClaimedParticipantCount"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    bind:value={claimedParticipantCount}
                    class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
                  >
                    {#each range($division.data?.data.minParticipantPerTeamCount ?? 1, $division.data?.data.maxParticipantPerTeamCount + 1) as count}
                      <option value={count}>{count}</option>
                    {/each}
                  </select>
                {:else}
                  <input
                    type="number"
                    id="claimed_participant_count"
                    name="ClaimedParticipantCount"
                    min={$division.data?.data.minParticipantPerTeamCount ?? undefined}
                    max={$division.data?.data.maxParticipantPerTeamCount ?? undefined}
                    class={`input transition border-2 normal-border join-item ${
                      $errors.Name ? 'hover:input-error' : 'hover:input-secondary'
                    } w-3/4`}
                    bind:value={claimedParticipantCount}
                  />
                {/if}
              </label>
            </div>
            <div
              class={$errors.ClaimedSubmissionCount
                ? 'tooltip tooltip-open tooltip-right tooltip-error'
                : ''}
              data-tip={$errors.ClaimedSubmissionCount ? $errors.ClaimedSubmissionCount : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('event.team.claimed_submission_count')}
                </span>
                {#if $division.data?.data.maxSubmissionCount && $division.data?.data.maxSubmissionCount <= 200}
                  <select
                    id="claimed_submission_count"
                    name="ClaimedSubmissionCount"
                    on:keydown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                    bind:value={claimedSubmissionCount}
                    class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
                  >
                    {#each range($division.data?.data.minSubmissionCount ?? 1, $division.data?.data.maxSubmissionCount + 1) as count}
                      <option value={count}>{count}</option>
                    {/each}
                  </select>
                {:else}
                  <input
                    type="number"
                    id="claimed_submission_count"
                    name="ClaimedSubmissionCount"
                    min={$division.data?.data.minSubmissionCount ?? undefined}
                    max={$division.data?.data.maxSubmissionCount ?? undefined}
                    class={`input transition border-2 normal-border join-item ${
                      $errors.Name ? 'hover:input-error' : 'hover:input-secondary'
                    } w-3/4`}
                    bind:value={claimedSubmissionCount}
                  />
                {/if}
              </label>
            </div>
            <div
              class={$errors.Description ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
              data-tip={$errors.Description ? $errors.Description : ''}
            >
              <label class="join my-2 w-full">
                <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                  {$t('common.description')}{$t('common.optional')}
                </span>
                <textarea
                  id="description"
                  name="Description"
                  class={`textarea transition border-2 normal-border join-item ${
                    $errors.Description ? 'hover:textarea-error' : 'hover:textarea-secondary'
                  } w-3/4 h-28`}
                  placeholder={`${$t('common.description')}${$t('common.optional')}`}
                ></textarea>
              </label>
            </div>
            <div class="w-full flex flex-col justify-center mt-6">
              <div
                class="tooltip tooltip-bottom tooltip-error w-full"
                class:tooltip-open={!!$message}
                data-tip={$message}
              >
                <button
                  type="submit"
                  class="btn {$allErrors.length > 0
                    ? 'btn-error'
                    : $submitting
                      ? 'btn-ghost'
                      : 'btn-outline border-2 normal-border'} w-full"
                  disabled={$submitting}
                >
                  {$allErrors.length > 0
                    ? $t('common.error')
                    : $submitting
                      ? $t('common.waiting')
                      : $t('common.submit')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>
