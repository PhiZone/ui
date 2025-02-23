<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import queryString from 'query-string';

  import { goto, invalidateAll, preloadData } from '$app/navigation';
  import Chart from '$lib/components/Chart.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';
  import Like from '$lib/components/Like.svelte';
  import Record from '$lib/components/Record.svelte';
  import Song from '$lib/components/Song.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import { t } from '$lib/translations/config';
  import { getAvatar, isEventHost, parseDateTime } from '$lib/utils';

  let { data } = $props();
  let { searchParams, index, id, api, user } = $derived(data);

  let divisionQuery = $derived(createQuery(api.event.division.info({ id })));
  let eventQuery = $derived(
    createQuery(
      api.event.info(
        { id: $divisionQuery.data?.data.eventId ?? '' },
        { enabled: $divisionQuery.isSuccess },
      ),
    ),
  );
  let leaderboardQuery = $derived(
    createQuery(
      api.event.division.leaderboard(
        {
          id,
          ...searchParams,
        },
        { enabled: index == 1 },
      ),
    ),
  );
  let tasksQuery = $derived(
    createQuery(
      api.event.task.listAll({
        rangeDivisionId: [id],
        rangeType: [0],
        order: ['dateExecuted', 'dateCreated'],
      }),
    ),
  );
  let divisionTag = $derived(
    createQuery(
      api.tag.info(
        { id: $divisionQuery.data?.data.tagId ?? '' },
        { enabled: $divisionQuery.isSuccess },
      ),
    ),
  );
  let tagsQuery = $derived(
    createQuery(api.event.division.listAllTags({ id }, { enabled: $divisionQuery.isSuccess })),
  );
  let songPrompts = $derived(
    createQuery(
      api.event.division.listSongPrompts(
        { id },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 1 && index == 0 },
      ),
    ),
  );
  let chartPrompts = $derived(
    createQuery(
      api.event.division.listChartPrompts(
        { id },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 2 && index == 0 },
      ),
    ),
  );
  let songEntries = $derived(
    createQuery(
      api.event.division.listSongEntries(
        {
          id,
          ...queryString.parse($divisionQuery.data?.data.suggestedEntrySearch ?? ''),
          perPage: 10,
        },
        {
          enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 0 && index == 2,
        },
      ),
    ),
  );
  let chartEntries = $derived(
    createQuery(
      api.event.division.listChartEntries(
        {
          id,
          ...queryString.parse($divisionQuery.data?.data.suggestedEntrySearch ?? ''),
          perPage: 10,
        },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 1 && index == 2 },
      ),
    ),
  );
  let recordEntries = $derived(
    createQuery(
      api.event.division.listRecordEntries(
        {
          id,
          ...queryString.parse($divisionQuery.data?.data.suggestedEntrySearch ?? ''),
          perPage: 10,
        },
        { enabled: $divisionQuery.isSuccess && $divisionQuery.data.data.type == 2 && index == 2 },
      ),
    ),
  );

  const maxMemberDisplay = 2;
  let teamName = $state('');
  let inviteCode = $state('');
  let focus = $state(0);
</script>

<svelte:head>
  <title>
    {$t('event.event')} - {$eventQuery.data?.data.title} ({$divisionQuery.data?.data.title}) | {$t(
      'common.site_name',
    )}
  </title>
</svelte:head>

{#if $divisionQuery.isSuccess && $eventQuery.isSuccess}
  {@const division = $divisionQuery.data.data}
  {@const event = $eventQuery.data.data}
  <input type="checkbox" id="illustration" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 p-0 max-w-fit aspect-video">
      <label
        for="illustration"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="absolute left-2 bottom-2">
        <div class="join join-horizontal">
          <div class="btn btn-secondary btn-xs join-item text-base no-animation">
            {$t('common.illustrator')}
          </div>
          <div class="btn btn-xs join-item text-base no-animation">
            {division.illustrator ?? event.illustrator}
          </div>
        </div>
      </div>
      <img
        src={division.illustration ?? event.illustration}
        alt="Illustration"
        class="object-cover"
      />
    </div>
  </div>

  <input type="checkbox" id="participate" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box text-left min-w-[40vw]">
      <label
        for="participate"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="flex flex-col lg:flex-row py-4">
        <div
          class="form-control flex-grow"
          onmouseenter={() => {
            focus = 1;
          }}
        >
          <h3 class="font-bold text-lg text-center">{$t('event.division.create_team')}</h3>
          <label class="join my-4 w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {$t('event.team.name')}
            </span>
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              class={'input transition border-2 normal-border hover:border-secondary join-item w-3/4'}
              bind:value={teamName}
              disabled={focus == 2}
            />
          </label>
          <button
            class="btn btn-outline border-2 normal-border hover:btn-secondary join-item"
            onclick={() => {
              goto(`/events/teams/new?divisionId=${division.id}&name=${teamName}`);
            }}
            disabled={focus == 2}
          >
            {$t('common.continue')}
          </button>
        </div>
        {#if !division.maxParticipantPerTeamCount || division.maxParticipantPerTeamCount > 1}
          <div class="divider lg:divider-horizontal">{$t('common.or')}</div>
          <div
            class="form-control flex-grow"
            onmouseenter={() => {
              focus = 2;
            }}
          >
            <h3 class="font-bold text-lg text-center">{$t('event.division.join_team')}</h3>
            <label class="join my-4 w-full">
              <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                {$t('event.team.invitation.invite_code')}
              </span>
              <input
                type="text"
                onkeydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                class={'input transition border-2 normal-border hover:border-secondary join-item w-3/4'}
                bind:value={inviteCode}
                disabled={focus == 1}
              />
            </label>
            <button
              class="btn btn-outline border-2 normal-border hover:btn-secondary join-item"
              onclick={() => {
                goto(`/events/teams/invite?code=${inviteCode.slice(-6)}`);
              }}
              disabled={focus == 1}
            >
              {$t('common.continue')}
            </button>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <div
    class="background min-h-screen"
    style:background-image="url({division.illustration ?? event.illustration})"
  >
    <div class="hero-overlay bg-opacity-60"></div>
    <div class="pt-32 pb-24 w-full flex flex-col max-w px-4 md:px-32 mx-auto">
      <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
        <a class="transition hover:text-accent" href="/events/{event.id}">{event.title}</a>
        / {division.title}
      </h1>
      {#if division.subtitle}
        <h2 class="text-4xl font-bold drop-shadow-lg my-3 text-neutral-content">
          {division.subtitle}
        </h2>
      {/if}
      {#if division.description}
        <p class="text-xl mt-3 mb-6 content text-neutral-content">
          {division.description}
        </p>
      {/if}
      <div class="flex justify-between items-center flex-wrap">
        <div class="my-4 flex gap-3">
          <Like
            id={division.id}
            likes={division.likeCount}
            type="events/divisions"
            liked={division.dateLiked != null}
            class="btn-md w-36 text-lg border-neutral-content text-neutral-content btn-outline backdrop-blur"
          />
          <label
            for="illustration"
            class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
          >
            {$t('common.view_illustration')}
          </label>
        </div>
        <div class="flex items-center gap-8">
          {#if division.status < 3}
            <Timer
              timeDue={new Date(division.status < 2 ? division.dateStarted : division.dateEnded)}
              text={division.status < 2 ? 'common.starts_at' : 'common.ends_at'}
              onTimeUp={async () => {
                await invalidateAll();
              }}
            />
          {:else}
            <div class="flex flex-col gap-2">
              <p class="truncate">
                <span class="badge badge-outline backdrop-blur mr-1">
                  {$t('common.date_started')}
                </span>
                {parseDateTime(division.dateStarted)}
              </p>
              <p class="truncate">
                <span class="badge badge-outline backdrop-blur mr-1">
                  {$t('common.date_ended')}
                </span>
                {parseDateTime(division.dateEnded)}
              </p>
            </div>
          {/if}
          {#if isEventHost(user, event)}
            <a
              href="/events/divisions/{division.id}/manage"
              class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
            >
              {$t('common.manage')}
            </a>
          {:else if division.team}
            <a
              href="/events/teams/{division.team.id}"
              class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
            >
              {$t('event.division.my_team')}
            </a>
          {:else if user && division.status < 3}
            <label
              for="participate"
              class="btn border-0 text-neutral-content btn-md min-w-fit w-36 text-lg bg-opacity-0 gradient btn-outline"
            >
              {$t('event.division.participate')}
            </label>
          {/if}
        </div>
      </div>
      <div class="flex flex-col lg:flex-row gap-3">
        <div class="lg:w-full">
          <div role="tablist" class="tabs tabs-lifted backdrop-blur-xl rounded-t-2xl mt-4">
            {#if division.type !== 0}
              <a
                role="tab"
                href="?index=0"
                tabindex="0"
                class="tab {index == 0 ? 'tab-active' : ''}"
              >
                {$t(division.type === 1 ? 'event.division.song_pool' : 'event.division.chart_pool')}
              </a>
            {/if}
            <a role="tab" href="?index=1" tabindex="0" class="tab {index == 1 ? 'tab-active' : ''}">
              {$t('common.leaderboard')}
            </a>
            <a role="tab" href="?index=2" tabindex="0" class="tab {index == 2 ? 'tab-active' : ''}">
              {$t('event.division.entries')}
            </a>
          </div>
          <div
            class="card rounded-t-none w-full bg-base-100 transition border-t-0 border-2 normal-border hover:shadow-lg mb-4"
          >
            <div class="card-body">
              {#if index == 0 && ($songPrompts.isSuccess || $chartPrompts.isSuccess)}
                {#if division.type == 1 && $songPrompts.isSuccess}
                  {@const prompts = $songPrompts.data.data}
                  {#if prompts.length > 0}
                    <div class="result">
                      {#each prompts as song}
                        <Song {song} />
                      {/each}
                    </div>
                  {:else}
                    <p class="py-3 text-center">{$t('common.empty')}</p>
                  {/if}
                {:else if division.type == 2 && $chartPrompts.isSuccess}
                  {@const prompts = $chartPrompts.data.data}
                  {#if prompts.length > 0}
                    <div class="result">
                      {#each prompts as chart}
                        <Chart {chart} />
                      {/each}
                    </div>
                  {:else}
                    <p class="py-3 text-center">{$t('common.empty')}</p>
                  {/if}
                {/if}
                <a
                  class="min-w-fit btn btn-sm border-2 normal-border btn-outline self-end"
                  href="/events/divisions/{id}/prompts"
                >
                  {$t('common.more')}
                  <i class="fa-solid fa-angles-right"></i>
                </a>
              {:else if index == 1 && $leaderboardQuery.isSuccess}
                {@const leaderboard = $leaderboardQuery.data.data}
                <div class="overflow-x-auto">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{$t('event.team.team')}</th>
                        <th>{$t('event.members')}</th>
                        <th>{$t('event.team.status')}</th>
                        <th>{$t('common.score')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each leaderboard as team}
                        <tr
                          class="transition {team.participants
                            .map((e) => e.id)
                            .includes(user?.id ?? 0)
                            ? 'bg-info-content bg-opacity-20'
                            : 'bg-base-100 bg-opacity-0 hover:bg-base-300'} hover:bg-opacity-75 hover:cursor-pointer"
                          onclick={() => {
                            goto(`/events/teams/${team.id}`);
                          }}
                          onmouseenter={() => {
                            preloadData(`/events/teams/${team.id}`);
                          }}
                        >
                          <td>{team.position}</td>
                          <td>
                            <div class="flex items-center gap-3">
                              <div class="avatar">
                                <div class="mask mask-circle w-12 h-12">
                                  <img src={getAvatar(team.icon)} alt="Icon" />
                                </div>
                              </div>
                              <div>
                                <div class="font-bold">{team.name}</div>
                                <!-- <Region region={team.owner.region} width={21} textCss="opacity-50" /> -->
                              </div>
                            </div>
                          </td>
                          <th>
                            <div class="avatar-group -space-x-3 rtl:space-x-reverse md:hidden">
                              {#each team.participants.slice(0, maxMemberDisplay) as participant}
                                <div class="avatar">
                                  <div class="mask mask-circle w-8 h-8">
                                    <img src={getAvatar(participant.avatar)} alt="Avatar" />
                                  </div>
                                </div>
                              {/each}
                              {#if team.participants.length > maxMemberDisplay}
                                <div class="avatar placeholder">
                                  <div
                                    class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content"
                                  >
                                    <span>+{team.participants.length - maxMemberDisplay}</span>
                                  </div>
                                </div>
                              {/if}
                            </div>
                            <div
                              class="md:avatar-group -space-x-3 rtl:space-x-reverse hidden lg:hidden"
                            >
                              {#each team.participants.slice(0, maxMemberDisplay * 2) as participant}
                                <div class="avatar">
                                  <div class="mask mask-circle w-8 h-8">
                                    <img src={getAvatar(participant.avatar)} alt="Avatar" />
                                  </div>
                                </div>
                              {/each}
                              {#if team.participants.length > maxMemberDisplay * 2}
                                <div class="avatar placeholder">
                                  <div
                                    class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content"
                                  >
                                    <span>+{team.participants.length - maxMemberDisplay * 2}</span>
                                  </div>
                                </div>
                              {/if}
                            </div>
                            <div
                              class="lg:avatar-group -space-x-3 rtl:space-x-reverse hidden xl:hidden"
                            >
                              {#each team.participants.slice(0, maxMemberDisplay * 2) as participant}
                                <div class="avatar">
                                  <div class="mask mask-circle w-8 h-8">
                                    <img src={getAvatar(participant.avatar)} alt="Avatar" />
                                  </div>
                                </div>
                              {/each}
                              {#if team.participants.length > maxMemberDisplay * 2}
                                <div class="avatar placeholder">
                                  <div
                                    class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content"
                                  >
                                    <span>+{team.participants.length - maxMemberDisplay * 2}</span>
                                  </div>
                                </div>
                              {/if}
                            </div>
                            <div
                              class="xl:avatar-group -space-x-3 rtl:space-x-reverse hidden 2xl:hidden"
                            >
                              {#each team.participants.slice(0, maxMemberDisplay * 4) as participant}
                                <div class="avatar">
                                  <div class="mask mask-circle w-8 h-8">
                                    <img src={getAvatar(participant.avatar)} alt="Avatar" />
                                  </div>
                                </div>
                              {/each}
                              {#if team.participants.length > maxMemberDisplay * 4}
                                <div class="avatar placeholder">
                                  <div
                                    class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content"
                                  >
                                    <span>+{team.participants.length - maxMemberDisplay * 4}</span>
                                  </div>
                                </div>
                              {/if}
                            </div>
                            <div class="2xl:avatar-group -space-x-3 rtl:space-x-reverse hidden">
                              {#each team.participants.slice(0, maxMemberDisplay * 8) as participant}
                                <div class="avatar">
                                  <div class="mask mask-circle w-8 h-8">
                                    <img src={getAvatar(participant.avatar)} alt="Avatar" />
                                  </div>
                                </div>
                              {/each}
                              {#if team.participants.length > maxMemberDisplay * 8}
                                <div class="avatar placeholder">
                                  <div
                                    class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content"
                                  >
                                    <span>+{team.participants.length - maxMemberDisplay * 8}</span>
                                  </div>
                                </div>
                              {/if}
                            </div>
                          </th>
                          <th>
                            <div
                              class="badge badge-lg badge-outline font-normal whitespace-nowrap {team.status ==
                              2
                                ? 'badge-success'
                                : team.status >= 3
                                  ? 'badge-error'
                                  : team.status == 1
                                    ? 'badge-accent'
                                    : ''}"
                            >
                              {$t(`event.team.statuses.${team.status}`)}
                            </div>
                          </th>
                          <th class="text-lg">
                            {team.score ?? '-'}
                          </th>
                        </tr>
                      {/each}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th>#</th>
                        <th>{$t('event.team.team')}</th>
                        <th>{$t('event.members')}</th>
                        <th>{$t('event.team.status')}</th>
                        <th>{$t('common.score')}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              {:else if index == 2 && ($songEntries.isSuccess || $chartEntries.isSuccess || $recordEntries.isSuccess)}
                {#if division.type == 0 && $songEntries.isSuccess}
                  {@const entries = $songEntries.data.data}
                  {#if entries.length > 0}
                    <div class="result">
                      {#each entries as song}
                        <Song {song} />
                      {/each}
                    </div>
                  {:else}
                    <p class="py-3 text-center">{$t('common.empty')}</p>
                  {/if}
                {/if}
                {#if division.type == 1 && $chartEntries.isSuccess}
                  {@const entries = $chartEntries.data.data}
                  {#if entries.length > 0}
                    <div class="result">
                      {#each entries as chart}
                        <Chart {chart} />
                      {/each}
                    </div>
                  {:else}
                    <p class="py-3 text-center">{$t('common.empty')}</p>
                  {/if}
                {:else if division.type == 2 && $recordEntries.isSuccess}
                  {@const entries = $recordEntries.data.data}
                  {#if entries.length > 0}
                    <div class="result">
                      {#each entries as record}
                        <Record {record} />
                      {/each}
                    </div>
                    <!-- <div class="overflow-x-auto">
                      <table class="table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>{$t('record.player')}</th>
                            <th>{$t('common.score')}</th>
                            <th>{$t('record.accuracy')}</th>
                            <th>{$t('record.perfect')}</th>
                            <th>{$t('record.good')}</th>
                            <th>{$t('record.bad')}</th>
                            <th>{$t('record.miss')}</th>
                            <th>{$t('record.rks')}</th>
                            <th>{$t('record.std_deviation')}</th>
                            <th>{$t('record.date_played')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {#each entries as record}
                            <tr
                              class="transition {record.ownerId === user?.id
                                ? 'bg-info-content bg-opacity-25'
                                : 'bg-base-100 bg-opacity-0 hover:bg-base-300'} hover:bg-opacity-75 hover:cursor-pointer"
                              on:click={() => {
                                goto(`/records/${record.id}`);
                              }}
                              on:mouseenter={() => {
                                preloadData(`/records/${record.id}`);
                              }}
                            >
                              <td>{record.position}</td>
                              <td>
                                <a
                                  href="/users/{record.ownerId}"
                                  class="flex items-center gap-3 hover:underline"
                                >
                                  <div class="avatar">
                                    <div class="mask mask-circle w-12 h-12">
                                      <img src={getAvatar(record.owner?.avatar)} alt="Avatar" />
                                    </div>
                                  </div>
                                  <div>
                                    <div class="font-bold">
                                      {record.owner?.userName ?? $t('common.anonymous')}
                                    </div>
                                  </div>
                                </a>
                              </td>
                              <th class="text-lg">
                                {record.score}
                              </th>
                              <td>{(record.accuracy * 100).toFixed(2)}%</td>
                              <td class="whitespace-nowrap">
                                {record.perfect}
                                <br />
                                <span class="opacity-70">
                                  (± {record.perfectJudgment} ms)
                                </span>
                              </td>
                              <td class="whitespace-nowrap">
                                {record.goodEarly + record.goodLate}
                                <span class="opacity-70">
                                  [E{record.goodEarly} · L{record.goodLate}]
                                </span>
                                <br />
                                <span class="opacity-70">
                                  (± {record.goodJudgment} ms)
                                </span>
                              </td>
                              <td class="whitespace-nowrap">
                                {record.bad}
                                <br />
                                <span class="opacity-70">
                                  (± {record.goodJudgment * 1.125} ms)
                                </span>
                              </td>
                              <td>{record.miss}</td>
                              <th>{record.rks.toFixed(3)}</th>
                              <td>
                                {record.stdDeviation.toFixed(3)} ms
                              </td>
                              <td>{parseDateTime(record.dateCreated)}</td>
                            </tr>
                          {/each}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th>#</th>
                            <th>{$t('record.player')}</th>
                            <th>{$t('common.score')}</th>
                            <th>{$t('record.accuracy')}</th>
                            <th>{$t('record.perfect')}</th>
                            <th>{$t('record.good')}</th>
                            <th>{$t('record.bad')}</th>
                            <th>{$t('record.miss')}</th>
                            <th>{$t('record.rks')}</th>
                            <th>{$t('record.std_deviation')}</th>
                            <th>{$t('record.date_played')}</th>
                          </tr>
                        </tfoot>
                      </table>
                    </div> -->
                  {:else}
                    <p class="py-3 text-center">{$t('common.empty')}</p>
                  {/if}
                {/if}
                <a
                  class="min-w-fit btn btn-sm border-2 normal-border btn-outline self-end"
                  href="/events/divisions/{id}/entries"
                >
                  {$t('common.more')}
                  <i class="fa-solid fa-angles-right"></i>
                </a>
              {/if}
              <!-- {#if $divisions.isLoading}
              <ul class="menu bg-base-100 w-full">
                <li class="overflow-hidden">
                  <div class="w-full h-[82px] flex px-5">
                    <div class="w-1/2">
                      <div class="w-[300px] h-7 skeleton rounded" />
                    </div>
                    <div class="w-5/12">
                      <div class="w-[200px] h-7 skeleton rounded" />
                    </div>
                    <div class="w-1/12 min-w-fit">
                      <btn class="w-16 h-12 btn btn-sm" disabled />
                    </div>
                  </div>
                </li>
              </ul>
            {:else if $divisions.isSuccess}
              {@const divisions = $divisions.data.data}
              {#if divisions.length > 0}
                <ul class="menu bg-base-100 w-full gap-2">
                  {#each divisions as division}
                    <li><EventDivision {division} /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if} -->
            </div>
          </div>
          {#if $divisionTag.isSuccess && $tagsQuery.isSuccess}
            {@const tags = [$divisionTag.data.data, ...$tagsQuery.data.data]}
            <div class="indicator w-full my-4">
              <span
                class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
                style:--tw-translate-x="0"
              >
                {$t('common.tags')}
              </span>
              <div
                class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
              >
                <div class="card-body py-10">
                  {#if tags.length > 0}
                    <div class="result-tight">
                      {#each tags as tag}
                        <Tag {tag} full />
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
        <div
          class="card my-4 h-fit bg-base-100 transition border-2 normal-border hover:shadow-lg lg:hover:w-3/4 lg:w-1/3"
          style:transition="width 400ms cubic-bezier(0.4, 0, 0.2, 1)"
        >
          <div class="card-body">
            <div class="stats stats-vertical sm:stats-horizontal">
              <div class="stat place-items-center">
                <div class="stat-title">{$t('event.division.team_count')}</div>
                <div class="stat-value text-3xl">{division.teamCount}</div>
                {#if division.maxTeamCount}
                  <div class="stat-desc">/ {division.maxTeamCount}</div>
                {/if}
              </div>
              <div class="stat place-items-center">
                <div class="stat-title">{$t('common.status')}</div>
                <div class="stat-value text-3xl">
                  {$t(`event.division.statuses.${division.status}`)}
                </div>
              </div>
              <div class="stat place-items-center">
                <div class="stat-title">{$t('event.division.entry_count')}</div>
                <div class="stat-value text-3xl">{division.entryCount}</div>
              </div>
            </div>
            {#if $tasksQuery.isSuccess}
              {@const tasks = $tasksQuery.data.data}
              <ul class="steps steps-vertical">
                {#each tasks as task}
                  <li
                    class="step {task.dateExecuted && new Date(task.dateExecuted) < new Date()
                      ? 'step-secondary'
                      : ''}"
                  >
                    <a
                      href="/events/divisions/{id}/tasks/{task.id}"
                      class="rounded-2xl transition-all hover:bg-base-200 cursor-pointer w-full overflow-hidden py-2"
                    >
                      {#if task.type === 0 && task.dateExecuted}
                        <p class="opacity-70">{parseDateTime(task.dateExecuted)}</p>
                      {/if}
                      <p class="font-bold">{task.name}</p>
                    </a>
                  </li>
                {/each}
              </ul>
            {/if}
            <a
              class="min-w-fit btn btn-sm border-2 normal-border btn-outline self-end"
              href="/events/divisions/{id}/tasks"
            >
              {$t('common.more')}
              <i class="fa-solid fa-angles-right"></i>
            </a>
          </div>
        </div>
      </div>
      <Comments type="events/divisions" id={division.id} {searchParams} />
    </div>
  </div>
{:else if $divisionQuery.isError}
  <Error error={$divisionQuery.error} back="/divisions" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}

<style lang="postcss">
  .gradient:not(:hover) {
    @apply bg-gradient-to-tl from-indigo-700 via-purple-600 to-pink-500;
  }
  .tabs-lifted > .tab {
    --tab-radius: 1rem;
    --tab-border: 2px;
    --tw-border-opacity: 1;
    --tab-border-color: rgb(156 163 175 / var(--tw-border-opacity));
    @media (prefers-color-scheme: dark) {
      --tw-border-opacity: 1;
      --tab-border-color: rgb(55 65 81 / var(--tw-border-opacity));
    }
  }
  .max-w {
    max-width: min(calc(100vw - 16px), 1600px);
  }
</style>
