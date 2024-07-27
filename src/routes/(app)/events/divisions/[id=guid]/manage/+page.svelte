<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import Error from '$lib/components/Error.svelte';
  import { goto, preloadData } from '$app/navigation';
  import { getAvatar, hasEventPermission } from '$lib/utils';
  import Song from '$lib/components/Song.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import ReservedField from '$lib/components/ReservedField.svelte';
  import { RESERVED_FIELD, RESOURCE, TEAM, UPDATE } from '$lib/hostshipPermissions.js';
  import Region from '$lib/components/Region.svelte';

  export let data;

  $: ({ searchParams, index, page, id, api, user } = data);

  $: division = createQuery(api.event.division.info({ id }));
  $: event = createQuery(
    api.event.info({ id: $division.data?.data.eventId ?? '' }, { enabled: $division.isSuccess }),
  );
  $: teams = createQuery(api.event.team.list({ rangeDivisionId: [id], perPage, ...searchParams }));
  $: reservedFieldsHeader = createQuery(api.event.division.listReservedFields({ id }));
  $: reservedFieldsTeam = createQuery(
    api.event.team.listReservedFields(
      { rangeDivisionId: [id], perPage, ...searchParams },
      { enabled: index == 1 },
    ),
  );
  $: songPrompts = createQuery(
    api.event.division.listSongPrompts(
      { id, perPage, ...searchParams },
      { enabled: $division.isSuccess && $division.data.data.type == 1 && index == 0 },
    ),
  );
  $: chartPrompts = createQuery(
    api.event.division.listChartPrompts(
      { id, perPage, ...searchParams },
      { enabled: $division.isSuccess && $division.data.data.type == 2 && index == 0 },
    ),
  );
  $: resources = createQuery(
    api.event.resource.list(
      { rangeDivisionId: [id], rangeType: [1], perPage, ...searchParams },
      { enabled: index == 2 },
    ),
  );
  $: reservedFieldsResource = createQuery(
    api.event.resource.listReservedFields(
      { rangeDivisionId: [id], rangeType: [1], perPage, ...searchParams },
      { enabled: index == 2 },
    ),
  );
  $: songEntries = createQuery(
    api.event.division.listSongEntries(
      { id, perPage, ...searchParams },
      { enabled: $division.isSuccess && $division.data.data.type == 0 && index == 2 },
    ),
  );
  $: chartEntries = createQuery(
    api.event.division.listChartEntries(
      { id, perPage, ...searchParams },
      { enabled: $division.isSuccess && $division.data.data.type == 1 && index == 2 },
    ),
  );
  $: recordEntries = createQuery(
    api.event.division.listRecordEntries(
      { id, perPage, ...searchParams },
      { enabled: $division.isSuccess && $division.data.data.type == 2 && index == 2 },
    ),
  );

  const maxMemberDisplay = 2;
  const perPage = 12;
</script>

<svelte:head>
  <title>
    {$t('common.manage')} | {$t('event.event')} - {$event.data?.data.title} ({$division.data?.data
      .title}) | {$t('common.title')}
  </title>
</svelte:head>

{#if $division.isSuccess && $event.isSuccess}
  {@const division = $division.data.data}
  {@const event = $event.data.data}
  <div
    class="background min-h-screen"
    style:background-image="url({division.illustration ?? event.illustration})"
  >
    <div class="hero-overlay bg-opacity-60" />
    <div class="pt-32 pb-24 w-full flex flex-col max-w px-4 md:px-32 mx-auto">
      <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
        <a class="transition hover:text-accent" href="/events/{event.id}">{event.title}</a>
        /
        <a class="transition hover:text-accent" href="/events/divisions/{division.id}">
          {division.title}
        </a>
      </h1>
      {#if division.subtitle}
        <h2 class="text-4xl font-bold drop-shadow-lg my-3 text-neutral-content">
          {division.subtitle}
        </h2>
      {/if}
      <div class="flex flex-col lg:flex-row gap-3">
        <div class="lg:w-full">
          <div role="tablist" class="tabs tabs-lifted backdrop-blur-xl rounded-t-2xl mt-4">
            {#if division.type !== 0}
              <div
                role="tab"
                tabindex="0"
                class="tab {index == 0 ? 'tab-active' : ''}"
                on:click={() => {
                  goto('?index=0');
                }}
                on:keyup
              >
                {$t(division.type === 1 ? 'event.division.song_pool' : 'event.division.chart_pool')}
              </div>
            {/if}
            <div
              role="tab"
              tabindex="0"
              class="tab {index == 1 ? 'tab-active' : ''}"
              on:click={() => {
                goto('?index=1');
              }}
              on:keyup
            >
              {$t('event.teams')}
            </div>
            <div
              role="tab"
              tabindex="0"
              class="tab {index == 2 ? 'tab-active' : ''}"
              on:click={() => {
                goto('?index=2');
              }}
              on:keyup
            >
              {$t('event.division.entries')}
            </div>
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
              {:else if index == 1 && $teams.isSuccess && $reservedFieldsTeam.isSuccess && $reservedFieldsHeader.isSuccess}
                {@const { total, perPage, data } = $teams.data}
                {#if total && perPage && data && data.length > 0}
                  {@const teams = data.map((e, i) => {
                    e.reservedFields = $reservedFieldsTeam.data.data[i];
                    if (
                      !Array.isArray(e.reservedFields) ||
                      !Array.isArray($reservedFieldsHeader.data.data)
                    ) {
                      e.reservedFields = [];
                      return e;
                    }
                    while (e.reservedFields.length < $reservedFieldsHeader.data.data.length) {
                      e.reservedFields.push(null);
                    }
                    return e;
                  })}
                  <div class="overflow-x-auto">
                    <table class="table">
                      <thead>
                        <tr>
                          <th>No.</th>
                          <th>{$t('event.team.team')}</th>
                          <th>{$t('event.members')}</th>
                          <th>{$t('event.team.status')}</th>
                          <th>{$t('common.score')}</th>
                          {#if $reservedFieldsHeader.isSuccess}
                            {@const reservedFields = $reservedFieldsHeader.data.data}
                            {#each reservedFields as field}
                              {#if field}
                                <th>{field.content}</th>
                              {/if}
                            {/each}
                          {/if}
                        </tr>
                      </thead>
                      <tbody>
                        {#each teams as team, i}
                          <tr
                            class="transition {team.participants
                              .map((e) => e.id)
                              .includes(user?.id ?? 0)
                              ? 'bg-info-content bg-opacity-20'
                              : 'bg-base-100 bg-opacity-0 hover:bg-base-300'} hover:bg-opacity-75"
                          >
                            <td>{i + (page - 1) * perPage + 1}</td>
                            <td
                              class="hover:underline hover:cursor-pointer min-w-[180px]"
                              on:click={() => {
                                goto(`/events/teams/${team.id}`);
                              }}
                              on:mouseenter={() => {
                                preloadData(`/events/teams/${team.id}`);
                              }}
                            >
                              <div class="flex items-center gap-3">
                                <div class="avatar">
                                  <div class="mask mask-circle w-12 h-12">
                                    <img src={getAvatar(team.icon)} alt="Icon" />
                                  </div>
                                </div>
                                <div>
                                  <div class="font-bold">{team.name}</div>
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
                                      <span>
                                        +{team.participants.length - maxMemberDisplay * 2}
                                      </span>
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
                                      <span>
                                        +{team.participants.length - maxMemberDisplay * 2}
                                      </span>
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
                                      <span>
                                        +{team.participants.length - maxMemberDisplay * 4}
                                      </span>
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
                                      <span>
                                        +{team.participants.length - maxMemberDisplay * 8}
                                      </span>
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
                            {#each team.reservedFields ?? [] as field, i}
                              <td>
                                <ReservedField
                                  {field}
                                  type="teams"
                                  id={team.id}
                                  headerIndex={$reservedFieldsHeader.data?.data[i]?.index}
                                  editable={hasEventPermission(user, event, UPDATE, TEAM) &&
                                    hasEventPermission(
                                      user,
                                      event,
                                      UPDATE,
                                      RESERVED_FIELD,
                                      $reservedFieldsHeader.data?.data[i]?.index,
                                    )}
                                />
                              </td>
                            {/each}
                          </tr>
                        {/each}
                      </tbody>
                      <tfoot>
                        <tr>
                          <th>No.</th>
                          <th>{$t('event.team.team')}</th>
                          <th>{$t('event.members')}</th>
                          <th>{$t('event.team.status')}</th>
                          <th>{$t('common.score')}</th>
                          {#if $reservedFieldsHeader.isSuccess}
                            {@const reservedFields = $reservedFieldsHeader.data.data}
                            {#each reservedFields as field}
                              {#if field}
                                <th>{field.content}</th>
                              {/if}
                            {/each}
                          {/if}
                        </tr>
                      </tfoot>
                    </table>
                    <Paginator {total} {perPage} {page} {searchParams} />
                  </div>
                {:else}
                  <p class="py-3 text-center">{$t('common.empty')}</p>
                {/if}
              {:else if index == 2 && $resources.isSuccess && $reservedFieldsResource.isSuccess && $reservedFieldsHeader.isSuccess && ($songEntries.isSuccess || $chartEntries.isSuccess || $recordEntries.isSuccess)}
                {@const { total, perPage, data } = $resources.data}
                {@const resources = data.map((e, i) => {
                  e.reservedFields = $reservedFieldsResource.data.data[i];
                  if (
                    !Array.isArray(e.reservedFields) ||
                    !Array.isArray($reservedFieldsHeader.data.data)
                  ) {
                    e.reservedFields = [];
                    return e;
                  }
                  while (e.reservedFields.length < $reservedFieldsHeader.data.data.length) {
                    e.reservedFields.push(null);
                  }
                  return e;
                })}
                <div class="overflow-x-auto">
                  {#if division.type == 0 && $songEntries.isSuccess}
                    {@const entries = $songEntries.data.data.sort(
                      (a, b) =>
                        resources.findIndex((e) => e.resourceId === a.id) -
                        resources.findIndex((e) => e.resourceId === b.id),
                    )}
                    {#if total && perPage && data && data.length > 0}
                      <table class="table">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>{$t('song.song')}</th>
                            <th>{$t('common.score')}</th>
                            {#if $reservedFieldsHeader.isSuccess}
                              {@const reservedFields = $reservedFieldsHeader.data.data}
                              {#each reservedFields as field}
                                {#if field}
                                  <th>{field.content}</th>
                                {/if}
                              {/each}
                            {/if}
                          </tr>
                        </thead>
                        <tbody>
                          {#each entries as song, i}
                            {@const resource = resources[i]}
                            <tr>
                              <td>{i + (page - 1) * perPage + 1}</td>
                              <td
                                class="transition hover:bg-base-300 bg-opacity-0 hover:bg-opacity-75 min-w"
                              >
                                <Song {song} kind="inline" showLike={false} />
                              </td>
                              <td class="text-lg">
                                {resource.score ?? '-'}
                              </td>
                              {#each resource.reservedFields ?? [] as field, i}
                                <td>
                                  <ReservedField
                                    {field}
                                    type="resources"
                                    id={`${resource.divisionId}/${resource.resourceId}`}
                                    headerIndex={$reservedFieldsHeader.data?.data[i]?.index}
                                    editable={hasEventPermission(user, event, UPDATE, RESOURCE) &&
                                      hasEventPermission(
                                        user,
                                        event,
                                        UPDATE,
                                        RESERVED_FIELD,
                                        $reservedFieldsHeader.data?.data[i]?.index,
                                      )}
                                  />
                                </td>
                              {/each}
                            </tr>
                          {/each}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th>No.</th>
                            <th>{$t('song.song')}</th>
                            <th>{$t('common.score')}</th>
                            {#if $reservedFieldsHeader.isSuccess}
                              {@const reservedFields = $reservedFieldsHeader.data.data}
                              {#each reservedFields as field}
                                {#if field}
                                  <th>{field.content}</th>
                                {/if}
                              {/each}
                            {/if}
                          </tr>
                        </tfoot>
                      </table>
                      <Paginator {total} {perPage} {page} {searchParams} />
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  {:else if division.type == 1 && $chartEntries.isSuccess}
                    {@const entries = $chartEntries.data.data.sort(
                      (a, b) =>
                        resources.findIndex((e) => e.resourceId === a.id) -
                        resources.findIndex((e) => e.resourceId === b.id),
                    )}
                    {#if total && perPage && data && data.length > 0}
                      <table class="table">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>{$t('chart.chart')}</th>
                            <th>{$t('common.score')}</th>
                            {#if $reservedFieldsHeader.isSuccess}
                              {@const reservedFields = $reservedFieldsHeader.data.data}
                              {#each reservedFields as field}
                                {#if field}
                                  <th>{field.content}</th>
                                {/if}
                              {/each}
                            {/if}
                          </tr>
                        </thead>
                        <tbody>
                          {#each entries as chart, i}
                            {@const resource = resources[i]}
                            <tr>
                              <td>{i + (page - 1) * perPage + 1}</td>
                              <td
                                class="transition hover:bg-base-300 bg-opacity-0 hover:bg-opacity-75 min-w"
                              >
                                <Chart {chart} kind="inline" showLike={false} />
                              </td>
                              <td class="text-lg">
                                {resource.score ?? '-'}
                              </td>
                              {#each resource.reservedFields ?? [] as field, i}
                                <td>
                                  <ReservedField
                                    {field}
                                    type="resources"
                                    id={`${resource.divisionId}/${resource.resourceId}`}
                                    headerIndex={$reservedFieldsHeader.data?.data[i]?.index}
                                    editable={hasEventPermission(user, event, UPDATE, RESOURCE) &&
                                      hasEventPermission(
                                        user,
                                        event,
                                        UPDATE,
                                        RESERVED_FIELD,
                                        $reservedFieldsHeader.data?.data[i]?.index,
                                      )}
                                  />
                                </td>
                              {/each}
                            </tr>
                          {/each}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th>No.</th>
                            <th>{$t('chart.chart')}</th>
                            <th>{$t('common.score')}</th>
                            {#if $reservedFieldsHeader.isSuccess}
                              {@const reservedFields = $reservedFieldsHeader.data.data}
                              {#each reservedFields as field}
                                {#if field}
                                  <th>{field.content}</th>
                                {/if}
                              {/each}
                            {/if}
                          </tr>
                        </tfoot>
                      </table>
                      <Paginator {total} {perPage} {page} {searchParams} />
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  {:else if division.type == 2 && $recordEntries.isSuccess}
                    {@const entries = $recordEntries.data.data.sort(
                      (a, b) =>
                        resources.findIndex((e) => e.resourceId === a.id) -
                        resources.findIndex((e) => e.resourceId === b.id),
                    )}
                    {#if total && perPage && data && data.length > 0}
                      <table class="table">
                        <thead>
                          <tr>
                            <th>No.</th>
                            <th>{$t('chart.chart')}</th>
                            <th>{$t('common.score')} ({$t('record.record')})</th>
                            <th>{$t('record.acc')}</th>
                            <th>{$t('record.rks')}</th>
                            <th>{$t('record.std_deviation')}</th>
                            <th>{$t('record.player')}</th>
                            <th>{$t('common.score')}</th>
                            {#if $reservedFieldsHeader.isSuccess}
                              {@const reservedFields = $reservedFieldsHeader.data.data}
                              {#each reservedFields as field}
                                {#if field}
                                  <th>{field.content}</th>
                                {/if}
                              {/each}
                            {/if}
                          </tr>
                        </thead>
                        <tbody>
                          {#each entries as record, i}
                            {@const resource = resources[i]}
                            <tr>
                              <td>{i + (page - 1) * perPage + 1}</td>
                              <td
                                class="transition hover:bg-base-300 bg-opacity-0 hover:bg-opacity-75"
                              >
                                {#if record.chart}
                                  <Chart
                                    chart={record.chart}
                                    kind="inline"
                                    showCharter={false}
                                    showLike={false}
                                  />
                                {/if}
                              </td>
                              <th class="text-lg">
                                <a href="/records/{record.id}" class="hover:underline">
                                  {record.score}
                                </a>
                              </th>
                              <td>{(record.accuracy * 100).toFixed(2)}%</td>
                              <th>{record.rks.toFixed(3)}</th>
                              <td>
                                {record.stdDeviation.toFixed(3)} ms
                              </td>
                              <td>
                                <a
                                  href="/users/{record.ownerId}"
                                  class="flex items-center gap-3 hover:underline min-w-fit"
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
                                    <Region
                                      region={record.owner?.region}
                                      width={21}
                                      textCss="opacity-50 xl:min-w-fit"
                                    />
                                  </div>
                                </a>
                              </td>
                              <td class="text-lg">
                                {resource.score ?? '-'}
                              </td>
                              {#each resource.reservedFields ?? [] as field, i}
                                <td>
                                  <ReservedField
                                    {field}
                                    type="resources"
                                    id={`${resource.divisionId}/${resource.resourceId}`}
                                    headerIndex={$reservedFieldsHeader.data?.data[i]?.index}
                                    editable={hasEventPermission(user, event, UPDATE, RESOURCE) &&
                                      hasEventPermission(
                                        user,
                                        event,
                                        UPDATE,
                                        RESERVED_FIELD,
                                        $reservedFieldsHeader.data?.data[i]?.index,
                                      )}
                                  />
                                </td>
                              {/each}
                            </tr>
                          {/each}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th>No.</th>
                            <th>{$t('chart.chart')}</th>
                            <th>{$t('common.score')} ({$t('record.record')})</th>
                            <th>{$t('record.acc')}</th>
                            <th>{$t('record.rks')}</th>
                            <th>{$t('record.std_deviation')}</th>
                            <th>{$t('record.player')}</th>
                            <th>{$t('common.score')}</th>
                            {#if $reservedFieldsHeader.isSuccess}
                              {@const reservedFields = $reservedFieldsHeader.data.data}
                              {#each reservedFields as field}
                                {#if field}
                                  <th>{field.content}</th>
                                {/if}
                              {/each}
                            {/if}
                          </tr>
                        </tfoot>
                      </table>
                      <Paginator {total} {perPage} {page} {searchParams} />
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{:else if $division.isError}
  <Error error={$division.error} back="/divisions" />
{:else}
  <div class="min-h-page skeleton" />
{/if}

<style>
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
  .min-w {
    min-width: max(calc(30vw - 200px), 140px);
  }
</style>
