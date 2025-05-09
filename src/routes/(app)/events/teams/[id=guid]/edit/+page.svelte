<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';

  import type { EventTeamDto } from '$lib/api/event';
  import type { PatchElement } from '$lib/api/types';

  import { invalidateAll } from '$app/navigation';
  import Delete from '$lib/components/Delete.svelte';
  import Error from '$lib/components/Error.svelte';
  import Cropper from '$lib/components/ImageCropper.svelte';
  import UpdateSuccess from '$lib/components/UpdateSuccess.svelte';
  import User from '$lib/components/User.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { applyPatch, getAvatar, range } from '$lib/utils';

  let { data } = $props();
  let { id, api } = $derived(data);

  let options = $derived(api.event.team.info({ id }));
  let query = $derived(createQuery({ ...options }));
  let division = $derived(
    createQuery(
      api.event.division.info(
        { id: $query.data?.data.divisionId ?? '' },
        { enabled: $query.isSuccess },
      ),
    ),
  );

  let team: EventTeamDto = $state($query.data?.data)!; // FIXME: hack
  let status = $state(Status.WAITING);
  let errorCode = $state('');
  let errors: Map<string, string> | undefined = $state();
  let positions: (string | null)[] = $state($query.data?.data.participants.map((e) => e.position))!;
  let deleted: boolean[] = $state($query.data?.data.participants.map(() => false))!;

  $effect(() => {
    if (!team && $query.isSuccess) {
      team = $query.data.data;
      positions = team.participants.map((e) => e.position);
      deleted = team.participants.map(() => false);
    }
  });

  let iconFiles: FileList | undefined = $state();
  let iconCropping = $state(false);
  let iconCropperSrc: string | undefined = $state();
  let iconSrc: string | undefined = $state();

  let patch = $state(new Array<PatchElement>());

  const queryClient = useQueryClient();

  const handleIcon = () => {
    if (iconFiles && iconFiles.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(iconFiles[0]);
      reader.onload = () => {
        iconCropperSrc = reader.result as string;
        iconCropping = true;
      };
    }
  };

  const update = async () => {
    status = Status.SENDING;
    errorCode = '';
    errors = undefined;
    const resp = await api.event.team.update({ id }, patch);
    if (resp.ok) {
      status = Status.OK;
      invalidateAll();
      await queryClient.invalidateQueries({ queryKey: options.queryKey });
      patch = [];
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
      errors = data.errors?.reduce((map, error) => {
        map.set(error.field, $t(`error.${error.errors[0]}`));
        return map;
      }, new Map<string, string>());
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        errors,
      );
    }
  };

  const updatePosition = async (index: number) => {
    if (positions[index] != team.participants[index].position) {
      const resp = await api.event.team.updateParticipant(
        { id: team.id, participantId: team.participants[index].id },
        [{ op: 'replace', path: '/position', value: positions[index] }],
      );
      if (resp.ok) {
        team.participants[index].position = positions[index];
      }
    }
  };
</script>

<svelte:head>
  <title>
    {$t('common.edit_info')} | {$t('event.team.team')} -
    {team.name}
    | {$t('event.event')} | {$t('common.site_name')}
  </title>
</svelte:head>
<UpdateSuccess checked={status === Status.OK} onClick={() => (status = Status.WAITING)} />

{#if $query.isSuccess && team}
  {#if iconCropping}
    <Cropper
      bind:open={iconCropping}
      title={$t('common.image_cropper')}
      src={iconCropperSrc!}
      aspectRatio={1}
      rounded
      submit={async (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            iconSrc = reader.result;
          }
        };
        const resp = await api.event.team.updateIcon({ id, File: blob });
        if (resp.ok) {
          invalidateAll();
          await queryClient.invalidateQueries({ queryKey: options.queryKey });
          iconCropping = false;
          status = Status.OK;
        } else {
          const error = await resp.json();
          // TODO: toast
          console.error(
            `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
            error,
          );
        }
      }}
    />
  {/if}
  <div class="bg-base-300 min-h-screen">
    <div class="pt-32 pb-4 flex justify-center">
      <div class="w-3/4 max-w-6xl min-w-20">
        <div class="flex justify-between">
          <h1 class="text-4xl font-bold mb-6">{$t('common.edit_info')}</h1>
          <a href="/events/teams/{team.id}" class="btn border-2 normal-border btn-outline">
            {$t('common.back')}
          </a>
        </div>
        <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg my-4">
          <div class="card-body">
            <form class="w-full form-control" onsubmit={(e) => e.preventDefault()}>
              <!-- <div class="flex items-center my-2">
              <span class="w-32">{$t('event.team.icon')}</span>
              <input
                type="file"
                id="icon"
                name="Icon"
                accept=".jpg, .jpeg, .png, .webp"
                class={`w-1/3 file:mr-4 file:py-2 file:border-0 file:btn ${
                  errors?.get('Icon')
                    ? 'input-error file:btn-error'
                    : 'input-secondary file:btn-outline file:bg-secondary'
                }`}
              />
              {#if !!errors?.get('Icon')}
                <span class="w-2/3 text-error">{errors?.get('Icon')}</span>
              {:else}
                <span class="w-2/3">{$t('common.form.tips.image')}</span>
              {/if}
            </div> -->
              <div class="flex gap-2 items-center w-full">
                <span class="w-1/6">
                  {$t('event.team.icon')}
                </span>
                <div class="icon w-5/6 flex flex-col sm:flex-row items-center">
                  <div
                    class="mx-auto rounded-full m-2 overflow-hidden w-[70px] h-[70px] md:w-[140px] md:h-[140px]"
                  >
                    <img
                      class="object-fill"
                      src={iconSrc ?? getAvatar(team.icon, 100)}
                      alt="Icon"
                    />
                  </div>
                  <input
                    type="file"
                    accept=".jpg, .jpeg, .png, .webp"
                    class="w-full sm:w-1/3 file:mr-2 file:py-2 file:border-0 file:btn input-secondary file:btn-outline file:bg-secondary"
                    bind:files={iconFiles}
                    onchange={handleIcon}
                  />
                  <span class="hidden sm:inline sm:w-1/3">{$t('common.form.tips.image')}</span>
                </div>
              </div>
              <div
                class={errors?.get('Name')
                  ? 'tooltip tooltip-open tooltip-right tooltip-error'
                  : ''}
                data-tip={errors?.get('Name') ? errors?.get('Name') : ''}
              >
                <label class="join my-2 w-full">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('event.team.name')}
                  </span>
                  <input
                    id="name"
                    name="Name"
                    class={`input transition border-2 normal-border join-item ${
                      errors?.get('Name') ? 'hover:input-error' : 'hover:input-secondary'
                    } w-3/4`}
                    bind:value={team.name}
                    oninput={(e) => {
                      patch = applyPatch(patch, 'replace', '/name', e.currentTarget.value);
                    }}
                  />
                </label>
              </div>
              <div
                class={errors?.get('ClaimedParticipantCount')
                  ? 'tooltip tooltip-open tooltip-right tooltip-error'
                  : ''}
                data-tip={errors?.get('ClaimedParticipantCount')
                  ? errors?.get('ClaimedParticipantCount')
                  : ''}
              >
                <label class="join my-2 w-full">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('event.team.claimed_participant_count')}
                  </span>
                  {#if $division.data?.data.maxParticipantPerTeamCount && $division.data?.data.maxParticipantPerTeamCount <= 200}
                    <select
                      id="claimed_participant_count"
                      name="ClaimedParticipantCount"
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
                      value={team.claimedParticipantCount}
                      oninput={(e) => {
                        team.claimedParticipantCount = parseInt(e.currentTarget.value);
                        patch = applyPatch(
                          patch,
                          'replace',
                          '/claimedParticipantCount',
                          team.claimedParticipantCount,
                        );
                      }}
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
                        errors?.get('Name') ? 'hover:input-error' : 'hover:input-secondary'
                      } w-3/4`}
                      value={team.claimedParticipantCount}
                      oninput={(e) => {
                        team.claimedParticipantCount = parseInt(e.currentTarget.value);
                        patch = applyPatch(
                          patch,
                          'replace',
                          '/claimedParticipantCount',
                          team.claimedParticipantCount,
                        );
                      }}
                    />
                  {/if}
                </label>
              </div>
              <div
                class={errors?.get('ClaimedSubmissionCount')
                  ? 'tooltip tooltip-open tooltip-right tooltip-error'
                  : ''}
                data-tip={errors?.get('ClaimedSubmissionCount')
                  ? errors?.get('ClaimedSubmissionCount')
                  : ''}
              >
                <label class="join my-2 w-full">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('event.team.claimed_submission_count')}
                  </span>
                  {#if $division.data?.data.maxSubmissionCount && $division.data?.data.maxSubmissionCount <= 200}
                    <select
                      id="claimed_submission_count"
                      name="ClaimedSubmissionCount"
                      onkeydown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }}
                      class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
                      value={team.claimedSubmissionCount}
                      oninput={(e) => {
                        team.claimedSubmissionCount = parseInt(e.currentTarget.value);
                        patch = applyPatch(
                          patch,
                          'replace',
                          '/claimedSubmissionCount',
                          team.claimedSubmissionCount,
                        );
                      }}
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
                        errors?.get('Name') ? 'hover:input-error' : 'hover:input-secondary'
                      } w-3/4`}
                      value={team.claimedSubmissionCount}
                      oninput={(e) => {
                        team.claimedSubmissionCount = parseInt(e.currentTarget.value);
                        patch = applyPatch(
                          patch,
                          'replace',
                          '/claimedSubmissionCount',
                          team.claimedSubmissionCount,
                        );
                      }}
                    />
                  {/if}
                </label>
              </div>
              <div
                class={errors?.get('Description')
                  ? 'tooltip tooltip-open tooltip-right tooltip-error relative my-2'
                  : 'relative my-2'}
                data-tip={errors?.get('Description') ? errors?.get('Description') : ''}
              >
                <label class="join w-full">
                  <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                    {$t('common.description')}{$t('common.optional')}
                  </span>
                  <textarea
                    id="description"
                    name="Description"
                    class={`textarea transition border-2 normal-border join-item ${
                      errors?.get('Description')
                        ? 'hover:textarea-error'
                        : 'hover:textarea-secondary'
                    } w-3/4 h-28`}
                    placeholder={`${$t('common.description')}${$t('common.optional')}`}
                    bind:value={team.description}
                    oninput={(e) => {
                      patch = applyPatch(patch, 'replace', '/description', e.currentTarget.value);
                    }}
                  ></textarea>
                </label>
                <button
                  type="button"
                  class="absolute right-2 bottom-2 btn btn-sm {team.description
                    ? 'border-2 hover:btn-outline backdrop-blur'
                    : 'btn-disabled'}"
                  onclick={() => {
                    team.description = '';
                    patch = applyPatch(patch, 'remove', '/description');
                  }}
                >
                  {$t('common.empty_v')}
                </button>
              </div>
              <div class="w-full flex flex-col justify-center mt-6">
                <div
                  class="tooltip tooltip-bottom tooltip-error w-full"
                  class:tooltip-open={status === Status.ERROR}
                  data-tip={status === Status.ERROR
                    ? ($t(`error.${errorCode}`) ?? $t('common.unknown_error'))
                    : null}
                >
                  <button
                    type="submit"
                    class="btn {status === Status.ERROR
                      ? 'btn-error'
                      : status === Status.SENDING
                        ? 'btn-ghost'
                        : 'btn-outline border-2 normal-border'} w-full"
                    disabled={status === Status.SENDING}
                    onclick={update}
                  >
                    {status === Status.ERROR
                      ? $t('common.error')
                      : status === Status.SENDING
                        ? $t('common.waiting')
                        : $t('common.submit')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('event.members')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10">
              {#if team.participants.length > 0}
                <div class="flex flex-col gap-4">
                  {#each team.participants as participant, index}
                    <div class="flex flex-col md:flex-row gap-3 justify-between items-center">
                      <div class="w-full md:w-1/3">
                        <User
                          id={participant.id}
                          initUser={participant}
                          kind="mini"
                          showFollow={false}
                        />
                      </div>
                      <label class="join w-full md:w-1/2">
                        <span class="btn no-animation join-item w-1/4">
                          {$t('common.position')}
                        </span>
                        <input
                          type="text"
                          placeholder={$t('common.position')}
                          class="input w-1/2 transition border-2 normal-border {deleted[index]
                            ? 'input-disabled'
                            : 'hover:input-secondary'} join-item"
                          disabled={deleted[index]}
                          bind:value={participant.position}
                        />
                        <button
                          class="btn btn-secondary join-item w-1/4"
                          class:btn-disabled={deleted[index] ||
                            (!participant.position && !positions[index]) ||
                            positions[index] == participant.position}
                          onclick={() => {
                            updatePosition(index);
                          }}
                        >
                          {$t('common.submit')}
                        </button>
                      </label>
                      <div class="flex gap-1 items-center justify-end w-full md:w-1/6 min-w-fit">
                        <Delete
                          id={participant.id.toString()}
                          path="events/teams/{team.id}/participants"
                          name="event.member"
                          class="btn-sm btn-square"
                          onDelete={() => {
                            deleted[index] = true;
                          }}
                        />
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if $query.isError}
  <Error error={$query.error} back="/resource-records" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
