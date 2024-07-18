<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { getAvatar, hasEventPermission } from '$lib/utils';
  import Song from '$lib/components/Song.svelte';
  import User from '$lib/components/User.svelte';
  import Record from '$lib/components/Record.svelte';
  import Error from '$lib/components/Error.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { UPDATE, TEAM, REMOVE } from '$lib/hostshipPermissions';
  import { Status } from '$lib/constants';
  import { goto } from '$app/navigation';
  import EventDivision from '$lib/components/EventDivision.svelte';

  export let data;
  const { user, id, api, url } = data;

  $: team = createQuery(api.event.team.info({ id }));
  $: division = createQuery(
    api.event.division.info(
      { id: $team.data?.data.divisionId ?? '' },
      { enabled: $team.isSuccess },
    ),
  );
  $: event = createQuery(
    api.event.info({ id: $division.data?.data.eventId ?? '' }, { enabled: $division.isSuccess }),
  );
  $: resources = createQuery(
    api.event.listAllResources(
      {
        rangeType: [1],
        rangeDivisionId: [$team.data?.data.divisionId ?? ''],
        rangeTeamId: [$team.data?.data.id ?? ''],
      },
      { enabled: $team.isSuccess },
    ),
  );
  $: songs = createQuery(
    api.song.list(
      { rangeId: $resources.data?.data.map((e) => e.resourceId) },
      {
        enabled:
          $resources.isSuccess &&
          $resources.data.data.length > 0 &&
          $division.isSuccess &&
          $division.data?.data.type == 0,
      },
    ),
  );
  $: charts = createQuery(
    api.chart.list(
      { rangeId: $resources.data?.data.map((e) => e.resourceId) },
      {
        enabled:
          $resources.isSuccess &&
          $resources.data.data.length > 0 &&
          $division.isSuccess &&
          $division.data?.data.type == 1,
      },
    ),
  );
  $: records = createQuery(
    api.record.list(
      { rangeId: $resources.data?.data.map((e) => e.resourceId) },
      {
        enabled:
          $resources.isSuccess &&
          $resources.data.data.length > 0 &&
          $division.isSuccess &&
          $division.data?.data.type == 2,
      },
    ),
  );

  let status = Status.WAITING;
  let copied = false;
  let errorCode = '';
  let inviteCode = '';

  const createInvitation = async () => {
    status = Status.SENDING;
    errorCode = '';
    const resp = await api.event.team.createInvite({ id });
    if (resp.ok) {
      status = Status.OK;
      inviteCode = (await resp.json()).data.code;
    } else {
      status = Status.ERROR;
      const data = await resp.json();
      errorCode = data.code;
    }
  };
</script>

<svelte:head>
  <title>
    {$t('event.team.team')} -
    {$team.isSuccess ? $team.data.data.name : ''}
    | {$t('event.event')} | {$t('common.title')}
  </title>
</svelte:head>

{#if $team.isSuccess}
  {@const team = $team.data.data}
  <input type="checkbox" id="invite" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box text-left">
      <label
        for="invite"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h3 class="font-bold text-lg">{$t('event.team.invitation.invite_code')}</h3>
      <div class="flex items-center justify-center py-6 h-28">
        {#if inviteCode && status !== Status.SENDING}
          <p class="text-5xl font-bold font-mono tracking-widest">{inviteCode}</p>
        {:else}
          <span class="loading loading-dots loading-lg"></span>
        {/if}
      </div>
      <p class="opacity-70 pb-7">{$t('event.team.invitation.invite_description')}</p>
      <div class="flex flex-col md:flex-row gap-6 justify-center mx-auto">
        <button
          class="btn btn-outline border-2 {copied
            ? 'btn-success btn-active'
            : 'normal-border'} md:w-2/5 w-full"
          on:click={() => {
            navigator.clipboard.writeText(
              $t('event.team.invitation.invite_msg', {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                user: user.userName,
                event: $event.data?.data.title,
                division: $division.data?.data.title,
                team: team.name,
                code: inviteCode,
                link: `${url.protocol}//${url.host}/events/teams/invite?code=${inviteCode}`,
              }),
            );
            copied = true;
            setTimeout(() => {
              copied = false;
            }, 2000);
          }}
        >
          {#if !copied}
            <span>
              {$t('event.team.invitation.copy')}
            </span>
          {:else}
            <span>
              <i class="fa-solid fa-check fa-xl"></i>
            </span>
          {/if}
        </button>
        <div
          class="md:w-2/5 w-full {status === Status.ERROR && errorCode
            ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
            : ''}"
          data-tip={errorCode ? $t(`error.${errorCode}`) : ''}
        >
          <button
            class="btn {status === Status.ERROR
              ? 'btn-error'
              : status === Status.SENDING
                ? 'btn-ghost'
                : 'btn-outline border-2 normal-border'} w-full"
            disabled={status === Status.SENDING}
            on:click={createInvitation}
          >
            {status === Status.ERROR
              ? $t('common.error')
              : status === Status.SENDING
                ? $t('common.waiting')
                : $t('event.team.invitation.refresh')}
          </button>
        </div>
      </div>
    </div>
  </div>
  <input type="checkbox" id="leave" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box text-left">
      <label
        for="leave"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h3 class="font-bold text-lg">{$t('event.team.leave')}</h3>
      <p class="py-4">
        {$t('event.team.leave_confirmation')}
      </p>
      <div class="modal-action">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <label
          for="leave"
          class="btn border-2 normal-border btn-outline"
          on:click={async () => {
            const resp = await api.DELETE(`/events/teams/${id}/participants/${user?.id}`);
            if (resp.ok || resp.status === 404) {
              goto(
                `/events/divisions/${team.divisionId}?level=success&message=${t.get(
                  'event.team.left',
                  {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    team: team.name,
                  },
                )}`,
              );
            } else {
              console.error(
                `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
                await resp.json(),
              );
            }
          }}
        >
          {$t('common.confirm')}
        </label>
      </div>
    </div>
  </div>
  <input type="checkbox" id="disband" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box text-left">
      <label
        for="disband"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <h3 class="font-bold text-lg">{$t('event.team.disband')}</h3>
      <p class="py-4">
        {$t('event.team.disband_confirmation')}
      </p>
      <div class="modal-action">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <label
          for="disband"
          class="btn border-2 normal-border btn-outline"
          on:click={async () => {
            const resp = await api.DELETE(`/events/teams/${id}`);
            if (resp.ok || resp.status === 404) {
              goto(
                `/events/divisions/${team.divisionId}?level=success&message=${t.get(
                  'event.team.disbanded',
                  {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    team: team.name,
                  },
                )}`,
              );
            } else {
              console.error(
                `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
                await resp.json(),
              );
            }
          }}
        >
          {$t('common.confirm')}
        </label>
      </div>
    </div>
  </div>
  <div class="background min-h-screen" style:background-image="url({getAvatar(team.icon)})">
    <div class="hero-overlay bg-opacity-70" />
    <div class="min-h-page backdrop-blur-3xl py-24 px-2 md:px-12 flex flex-col items-center">
      <div class="py-3 flex flex-col sm:flex-row gap-4 items-center max-w-5xl">
        <div class="avatar">
          <div class="mask mask-circle w-12 h-12 md:w-20 md:h-20">
            <img src={getAvatar(team.icon)} alt="Icon" />
          </div>
        </div>
        <h2 class="text-5xl font-bold content md:inline-block">
          {team.name}
        </h2>
      </div>
      {#if team.description}
        <p class="text-xl mt-3 mb-6 content text-neutral-content max-w-5xl">
          {team.description}
        </p>
      {/if}
      <div class="mx-auto max-w-7xl min-w-[60vw]">
        <div class="flex justify-center mx-4">
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('event.team.team')}
            </span>
            <div
              class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
            >
              <div class="card-body py-10 flex flex-col gap-6">
                <div class="stats stats-vertical sm:stats-horizontal">
                  <div class="stat place-items-center">
                    <div class="stat-title">{$t('common.rank')}</div>
                    <div class="stat-value text-4xl">#{team.position ?? '-'}</div>
                  </div>
                  <div class="stat place-items-center">
                    <div class="stat-title">{$t('common.score')}</div>
                    <div class="stat-value text-4xl">{team.score ?? '-'}</div>
                  </div>
                  <div class="stat place-items-center">
                    <div class="stat-title">{$t('event.team.status')}</div>
                    <div class="stat-value text-4xl">
                      {$t(`event.team.statuses.${team.status}`)}
                    </div>
                  </div>
                  <div class="stat place-items-center">
                    <div class="stat-title">{$t('event.team.participant_count')}</div>
                    <div class="stat-value text-4xl">{team.participants.length}</div>
                    <div class="stat-desc">/ {team.claimedParticipantCount}</div>
                  </div>
                  <div class="stat place-items-center">
                    <div class="stat-title">{$t('event.team.submission_count')}</div>
                    <div class="stat-value text-4xl">{$resources.data?.data.length ?? '-'}</div>
                    <div class="stat-desc">/ {team.claimedSubmissionCount}</div>
                  </div>
                </div>
                <div class="flex justify-center gap-2">
                  {#if hasEventPermission(user, $event.data?.data, UPDATE, TEAM) || user?.id === team.ownerId}
                    <a
                      href="/events/teams/{team.id}/edit"
                      class="btn border-2 normal-border btn-outline text-lg w-32"
                    >
                      {$t('common.edit_info')}
                    </a>
                    {#if team.participants.length < team.claimedParticipantCount}
                      <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                      <label
                        for="invite"
                        class="btn border-2 normal-border btn-outline text-lg w-32"
                        on:click={() => {
                          if (!inviteCode) createInvitation();
                        }}
                        on:keyup
                      >
                        {$t('event.team.invitation.invite_code')}
                      </label>
                    {/if}
                  {/if}
                  {#if user && team.participants.some((e) => e.id == user.id) && user.id != team.ownerId}
                    <label
                      for="leave"
                      class="btn border-2 normal-border btn-outline hover:btn-warning text-lg w-32"
                    >
                      {$t('event.team.leave')}
                    </label>
                  {/if}
                  {#if hasEventPermission(user, $event.data?.data, REMOVE, TEAM) || user?.id == team.ownerId}
                    <label
                      for="disband"
                      class="btn border-2 normal-border btn-outline hover:btn-error text-lg w-32"
                    >
                      {$t('event.team.disband')}
                    </label>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="w-full justify-center flex flex-col lg:flex-row">
          <div class="w-80 form-control mx-auto lg:mx-4">
            <div class="indicator w-full my-4">
              <span
                class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
                style:--tw-translate-x="0"
              >
                {$t('common.owner')}
              </span>
              <User id={team.ownerId} />
            </div>
            {#if $division.isSuccess && $event.isSuccess}
              {@const division = $division.data.data}
              {@const event = $event.data.data}
              <div class="indicator w-full my-4">
                <span
                  class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
                  style:--tw-translate-x="0"
                >
                  {$t('event.division.division')}
                </span>
                <EventDivision {division} {event} kind="full" />
              </div>
            {/if}
          </div>
          <div class="mx-4 w-full">
            <div class="indicator w-full my-4">
              <span
                class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
                style:--tw-translate-x="0"
              >
                {$t('event.members')}
              </span>
              <div
                class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
              >
                <div class="card-body py-10">
                  {#if team.participants.length > 0}
                    <div class="result">
                      {#each team.participants as participant}
                        <User id={participant.id} initUser={participant} fixedHeight />
                      {/each}
                    </div>
                  {:else}
                    <p class="py-3 text-center">{$t('common.empty')}</p>
                  {/if}
                </div>
              </div>
            </div>
            {#if $songs.isSuccess}
              <div class="indicator w-full my-4">
                <span
                  class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
                  style:--tw-translate-x="0"
                >
                  {$t('event.team.submissions')}
                </span>
                <div
                  class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
                >
                  <div class="card-body py-10">
                    {#if $songs.data.data.length > 0}
                      <div class="result">
                        {#each $songs.data.data as entry}
                          <Song song={entry} />
                        {/each}
                      </div>
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
            {#if $charts.isSuccess}
              <div class="indicator w-full my-4">
                <span
                  class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
                  style:--tw-translate-x="0"
                >
                  {$t('event.team.submissions')}
                </span>
                <div
                  class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
                >
                  <div class="card-body py-10">
                    {#if $charts.data.data.length > 0}
                      <div class="result">
                        {#each $charts.data.data as entry}
                          <Chart chart={entry} />
                        {/each}
                      </div>
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
            {#if $records.isSuccess}
              <div class="indicator w-full my-4">
                <span
                  class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
                  style:--tw-translate-x="0"
                >
                  {$t('event.team.submissions')}
                </span>
                <div
                  class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
                >
                  <div class="card-body py-10">
                    {#if $records.data.data.length > 0}
                      <div class="result">
                        {#each $records.data.data as entry}
                          <Record record={entry} />
                        {/each}
                      </div>
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if $team.isError}
  <Error error={$team.error} back="/events" />
{:else}
  <div class="min-h-page skeleton" />
{/if}
