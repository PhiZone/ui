<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { enhance } from '$app/forms';
  import { t } from '$lib/translations/config';
  import { getLevelDisplay, getUserLevel, getUserPrivilege, parseDateTime } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import { Status } from '$lib/constants';
  import Song from '$lib/components/Song.svelte';
  import User from '$lib/components/User.svelte';
  import Like from '$lib/components/Like.svelte';
  import Collection from '$lib/components/Collection.svelte';
  import Record from '$lib/components/Record.svelte';
  import Comments from '$lib/components/Comments.svelte';
  import ChartRadar from '$lib/components/ChartRadar.svelte';
  import Rating from '$lib/components/Rating.svelte';
  import { PUBLIC_DEDICATED_PLAYER_ENDPOINT } from '$env/static/public';
  import ChartAsset from '$lib/components/ChartAsset.svelte';
  import Error from '$lib/components/Error.svelte';
  import InteractiveRating from '$lib/components/InteractiveRating.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import ChartLabel from '$lib/components/ChartDifficulty.svelte';
  import AnonymizationNotice from '$lib/components/AnonymizationNotice.svelte';

  export let data, form;
  const {
    searchParams,
    id,
    user,
    api,
    queryClient,
    preferredPlayConfiguration,
    preferredApplication,
  } = data;

  const getMultiplier = (level: number): number => {
    switch (level) {
      case 0:
        return 0.0;
      case 1:
        return 1.0;
      case 2:
        return 1.1;
      case 3:
        return 1.2;
      case 4:
        return 1.3;
      case 5:
        return 1.4;
      case 6:
        return 1.5;
      case 7:
        return 1.6;
      case 8:
        return 1.8;
      case 9:
        return 2.0;
      case 10:
        return 3.0;
    }
    return 0;
  };

  $: chart = createQuery(api.chart.info({ id }));
  $: collections = createQuery(api.chart.listAllAdmitters({ id }));
  $: leaderboard = createQuery(api.chart.leaderboard({ id }));
  $: votes = createQuery(api.vote.listAll({ chartId: id }));
  $: myVote = createQuery(api.vote.listAll({ chartId: id, rangeOwnerId: [user?.id ?? 0] }));
  $: charter = richtext($chart.data?.data.authorName ?? $t('common.anonymous'));

  $: preferredPlayConfigurationQuery = createQuery(
    api.playConfiguration.list(
      { rangeId: [preferredPlayConfiguration ?? ''] },
      { enabled: !!preferredPlayConfiguration && !!user },
    ),
  );
  $: preferredApplicationQuery = createQuery(
    api.application.list(
      { rangeId: [preferredApplication ?? ''], rangeType: [0] },
      { enabled: !!preferredApplication && !!user },
    ),
  );

  $: playConfigurations = createQuery(
    api.playConfiguration.listAll(
      { rangeOwnerId: [user?.id ?? 0] },
      { enabled: playOpen && !!user },
    ),
  );
  $: applications = createQuery(
    api.application.listAll({ rangeType: [0] }, { enabled: playOpen && !!user }),
  );
  $: assets = createQuery(api.chart.asset.listAll({ chartId: id }));
  $: authorships = createQuery(api.authorship.listAll({ rangeResourceId: [id] }));

  let status = Status.WAITING;
  let arrangement = 0;
  let gameplay = 0;
  let vfx = 0;
  let creativity = 0;
  let concord = 0;
  let impression = 0;
  let voteOpen = false;
  let voteSync = false;
  let playOpen = false;
  let selectedPlayConfiguration = preferredPlayConfiguration ?? '';
  let selectedApplication = preferredApplication ?? '';
  let playStatus = Status.WAITING;

  $: if (!voteSync && $myVote.isSuccess && $myVote.data.data.length > 0) {
    arrangement = $myVote.data.data[0].arrangement;
    gameplay = $myVote.data.data[0].gameplay;
    vfx = $myVote.data.data[0].visualEffects;
    creativity = $myVote.data.data[0].creativity;
    concord = $myVote.data.data[0].concord;
    impression = $myVote.data.data[0].impression;
    voteSync = true;
  }
</script>

<svelte:head>
  <title>
    {$t('chart.chart')} -
    {$chart.isSuccess
      ? `${$chart.data.data.title ?? $chart.data.data.song.title} [${
          $chart.data.data.level
        } ${getLevelDisplay($chart.data.data.difficulty)}]`
      : ''}
    | {$t('common.title')}
  </title>
</svelte:head>

{#if $chart.isSuccess}
  {@const chart = $chart.data.data}
  {#if user}
    <input type="checkbox" id="play" class="modal-toggle" bind:checked={playOpen} />
    <div class="modal" role="dialog">
      <div class="modal-box min-w-[30vw]">
        <label
          for="play"
          class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
        >
          ✕
        </label>
        <h3 class="font-bold text-lg mb-2">{$t('chart.play')}</h3>
        <div class="form-control gap-4">
          {#if $playConfigurations.isSuccess}
            <label class="join w-full">
              <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                {$t('play_configuration.play_configuration')}
              </span>
              <select
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                bind:value={selectedPlayConfiguration}
                class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
              >
                {#each $playConfigurations.data.data as playConfiguration}
                  <option value={playConfiguration.id}>
                    {playConfiguration.name ?? $t('common.unnamed')} [{playConfiguration.perfectJudgment}
                    / {playConfiguration.goodJudgment}]
                  </option>
                {/each}
              </select>
            </label>
          {/if}
          {#if $applications.isSuccess}
            <label class="join w-full">
              <span class="btn no-animation join-item w-1/4 min-w-[64px]">
                {$t('application.application')}
              </span>
              <select
                on:keydown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                  }
                }}
                bind:value={selectedApplication}
                class="select transition border-2 normal-border join-item w-3/4 hover:select-secondary"
              >
                {#each $applications.data.data as application}
                  <option value={application.id}>
                    [{$t(`application.types.${application.type}`)}] {application.name}
                  </option>
                {/each}
              </select>
            </label>
          {/if}
          <div class="card-actions justify-end">
            <button
              class="btn {!selectedPlayConfiguration ||
              !selectedApplication ||
              playStatus === Status.SENDING
                ? 'btn-disabled'
                : playStatus === Status.ERROR
                  ? 'btn-error'
                  : 'border-2 normal-border btn-ghost hover:btn-outline'} join-item"
              on:click={async () => {
                playStatus = Status.SENDING;
                const resp = await api.chart.play({
                  chartId: chart.id,
                  configurationId: selectedPlayConfiguration ?? '',
                  applicationId: selectedApplication ?? '',
                });
                if (resp.ok && $applications.isSuccess) {
                  const data = await resp.json();
                  // console.log(
                  //   'Opening',
                  //   `${
                  //     $applications.data.data.find((e) => e.id == selectedApplication)?.apiEndpoint
                  //   }player=${user?.id}&chart=${
                  //     chart.id
                  //   }&configuration=${selectedPlayConfiguration}&token=${
                  //     data.data.token
                  //   }&timestamp=${data.data.timestamp}`,
                  // );
                  window.open(
                    `${
                      $applications.data.data.find((e) => e.id == selectedApplication)?.apiEndpoint
                    }player=${user?.id}&chart=${
                      chart.id
                    }&configuration=${selectedPlayConfiguration}&token=${
                      data.data.token
                    }&timestamp=${data.data.timestamp}`,
                    '_blank',
                  );
                  playOpen = false;
                  playStatus = Status.OK;
                } else {
                  playStatus = Status.ERROR;
                  console.error(
                    `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
                    await resp.json(),
                  );
                }
              }}
            >
              <i class="fa-solid fa-play fa-lg"></i>
              {$t('chart.play')}
            </button>
          </div>
        </div>
      </div>
    </div>
    <input type="checkbox" id="chart-vote" class="modal-toggle" bind:checked={voteOpen} />
    <div class="modal">
      <div class="modal-box bg-base-100 min-w-fit max-w-fit">
        <label
          for="chart-vote"
          class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
        >
          ✕
        </label>
        <h2 class="font-bold text-xl mb-4">{$t('common.vote')}</h2>
        <form
          class="form-control gap-1"
          method="POST"
          action="?/vote"
          use:enhance={() => {
            status = Status.SENDING;

            return async ({ result, update }) => {
              if (result.type === 'failure') {
                status = Status.ERROR;
              } else if (result.type === 'success') {
                status = Status.OK;
                await queryClient.invalidateQueries(['chart.info', { id }]);
                await queryClient.invalidateQueries(['vote.listAll', { chartId: id }]);
                // TODO: toast
                voteOpen = false;
              }
              await update();
            };
          }}
        >
          <div class="overflow-x-auto">
            <table class="table table-xs">
              <tbody>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.arrangement')}
                    </div>
                  </td>
                  <td>
                    <InteractiveRating aspect="arrangement" bind:rating={arrangement} />
                  </td>
                  <td class="text-xl font-bold text-center">{arrangement}</td>
                </tr>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.gameplay')}
                    </div>
                  </td>
                  <td>
                    <InteractiveRating aspect="gameplay" bind:rating={gameplay} />
                  </td>
                  <td class="text-xl font-bold text-center">{gameplay}</td>
                </tr>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.vfx')}
                    </div>
                  </td>
                  <td>
                    <InteractiveRating aspect="visualEffects" bind:rating={vfx} />
                  </td>
                  <td class="text-xl font-bold text-center">{vfx}</td>
                </tr>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.creativity')}
                    </div>
                  </td>
                  <td>
                    <InteractiveRating aspect="creativity" bind:rating={creativity} />
                  </td>
                  <td class="text-xl font-bold text-center">{creativity}</td>
                </tr>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.concord')}
                    </div>
                  </td>
                  <td>
                    <InteractiveRating aspect="concord" bind:rating={concord} />
                  </td>
                  <td class="text-xl font-bold text-center">{concord}</td>
                </tr>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.impression')}
                    </div>
                  </td>
                  <td>
                    <InteractiveRating aspect="impression" bind:rating={impression} />
                  </td>
                  <td class="text-xl font-bold text-center">{impression}</td>
                </tr>
                <tr style:border-bottom-width="0px">
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.multiplier')}
                    </div>
                  </td>
                  <td class="text-xl font-bold h-[52px]">
                    {getMultiplier(getUserLevel(user.experience)).toFixed(1)}
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="badge badge-lg badge-neutral w-full text-lg whitespace-nowrap">
                      {$t('chart.score')}
                    </div>
                  </td>
                  <td class="text-xl font-bold h-[52px]">
                    {(
                      (arrangement + gameplay + vfx + creativity + concord + impression) *
                      getMultiplier(getUserLevel(user.experience))
                    ).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-action">
            <div
              class="tooltip tooltip-top tooltip-error w-full"
              class:tooltip-open={status === Status.ERROR}
              data-tip={status === Status.ERROR
                ? $t(`error.${form?.error}`) ?? $t('common.unknown_error')
                : null}
            >
              <button
                type="submit"
                class="btn {status === Status.ERROR
                  ? 'btn-error'
                  : status === Status.SENDING
                    ? 'btn-ghost'
                    : 'btn-outline border-2 normal-border'} w-full"
                disabled={status == Status.SENDING}
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
  {/if}
  <div class="info-page">
    <div class="mx-4 max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('chart.chart')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              <h2 class="text-5xl font-bold content md:inline-block">
                {chart.title ?? chart.song.title}
              </h2>
              <ChartLabel {chart} large />
            </div>
            <div class="flex flex-col lg:flex-row">
              <div class="lg:w-1/2">
                <div class="pb-2">
                  <Rating rating={chart.rating} size="lg" />
                </div>
                <p>
                  <span class="badge mr-1">{$t('chart.level')}</span>
                  {chart.level}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('chart.difficulty')}
                  </span>
                  {chart.difficulty.toFixed(1)}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.charter')}</span>
                  {#if chart.authorName}
                    {@html $charter}
                  {:else}
                    {$t('common.anonymous')}
                  {/if}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.notes')}</span>
                  {chart.noteCount}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.format')}</span>
                  {$t(`chart.formats.${chart.format}`)}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.score')}</span>
                  {chart.score.toFixed(2)}
                </p>
                <p>
                  <span class="badge mr-1">{$t('chart.rating')}</span>
                  {chart.rating.toFixed(2)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('chart.equivalent_vote_count')}
                  </span>
                  {chart.rating > 0 ? (chart.score / chart.rating).toFixed(2) : 0}
                </p>
                {#if $votes.isSuccess}
                  <p>
                    <span class="badge mr-1">
                      {$t('chart.real_vote_count')}
                    </span>
                    {$votes.data?.total}
                  </p>
                {/if}
                <p>
                  <span class="badge mr-1">
                    {$t('common.created_at')}
                  </span>
                  {parseDateTime(chart.dateCreated)}
                </p>
                <p>
                  <span class="badge mr-1">
                    {$t('common.updated_at')}
                  </span>
                  {parseDateTime(chart.dateUpdated)}
                </p>
                {#if chart.description}
                  <p class="content">
                    <span class="badge mr-1">
                      {$t('common.description')}
                    </span>
                    {chart.description}
                  </p>
                {/if}
                {#if chart.tags.length > 0}
                  <p class="inline-flex gap-1 flex-wrap">
                    <span class="badge">
                      {$t('common.tags')}
                    </span>
                    {#each chart.tags as tag}
                      <Tag {tag} />
                    {/each}
                  </p>
                {/if}
              </div>
              <div class="divider lg:divider-horizontal" />
              <div class="lg:w-1/2 float-right p-4 form-control gap-3">
                <ChartRadar {chart} />
                <div
                  class="justify-center join join-vertical sm:join-horizontal lg:join-vertical xl:join-horizontal"
                >
                  <Like
                    id={chart.id}
                    likes={chart.likeCount}
                    type="charts"
                    liked={chart.dateLiked != null}
                    class="btn-md join-item"
                  />
                  {#if user}
                    <label
                      for="chart-vote"
                      class="btn btn-ghost border-2 hover:btn-outline join-item"
                    >
                      <i class="fa-solid fa-check-to-slot fa-lg"></i>
                      {$t('common.vote')}
                    </label>
                    {#if chart.file}
                      <a
                        href={chart.file}
                        target="_blank"
                        download={chart.file.split('/').pop()}
                        class="btn btn-ghost border-2 hover:btn-outline join-item"
                      >
                        <i class="fa-solid fa-file-arrow-down fa-lg"></i>
                        {$t('common.download')}
                      </a>
                      <a
                        href="{PUBLIC_DEDICATED_PLAYER_ENDPOINT}?type=custom&play=1&mode=preview&flag=noRequestingFullscreen&chart={encodeURI(
                          chart.file,
                        )}&song={encodeURI(chart.song.file ?? '')}&illustration={encodeURI(
                          chart.song.illustration ?? '',
                        )}&name={chart.title ??
                          chart.song.title}&level={chart.level}&difficulty={getLevelDisplay(
                          chart.difficulty,
                        )}&composer={chart.song.authorName}&illustrator={chart.song
                          .illustrator}&charter={chart.authorName}&assets={$assets.data?.data
                          .map((asset) => encodeURI(asset.file))
                          .join(',')}"
                        class="btn btn-ghost border-2 hover:btn-outline join-item"
                        target="_target"
                      >
                        <i class="fa-solid fa-eye fa-lg"></i>
                        {$t('common.preview')}
                      </a>
                      {#if chart.accessibility !== 2}
                        <button
                          class="btn btn-ghost border-2 hover:btn-outline join-item"
                          on:click={async () => {
                            if (
                              $preferredPlayConfigurationQuery.isSuccess &&
                              $preferredPlayConfigurationQuery.data.data.length > 0 &&
                              $preferredApplicationQuery.isSuccess &&
                              $preferredApplicationQuery.data.data.length > 0
                            ) {
                              const resp = await api.chart.play({
                                chartId: chart.id,
                                configurationId: $preferredPlayConfigurationQuery.data.data[0].id,
                                applicationId: $preferredApplicationQuery.data.data[0].id,
                              });
                              if (resp.ok) {
                                const data = await resp.json();
                                // console.log(
                                //   'Opening',
                                //   `${$preferredApplicationQuery.data.data[0].apiEndpoint}player=${user?.id}&chart=${chart.id}&configuration=${$preferredPlayConfigurationQuery.data.data[0].id}&token=${data.data.token}&timestamp=${data.data.timestamp}`,
                                // );
                                window.open(
                                  `${$preferredApplicationQuery.data.data[0].apiEndpoint}player=${user?.id}&chart=${chart.id}&configuration=${$preferredPlayConfigurationQuery.data.data[0].id}&token=${data.data.token}&timestamp=${data.data.timestamp}`,
                                  '_blank',
                                );
                              }
                            } else {
                              playOpen = true;
                            }
                          }}
                        >
                          <i class="fa-solid fa-play fa-lg"></i>
                          {$t('chart.play')}
                        </button>
                      {/if}
                    {/if}
                  {/if}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {#if $authorships.isSuccess && $authorships.data.data.length > 0}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.charter')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body py-10">
              {#if $authorships.data.data.length > 0}
                <div
                  class="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2"
                >
                  {#each $authorships.data.data as author}
                    <User id={author.id} initUser={author} kind="mini" showFollow={false} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
      {#if $assets.isSuccess && ($assets.data.data.length > 0 || getUserPrivilege(user?.role) === 6)}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('chart.assets')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body pt-14 pb-10">
              <a
                class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
                href="/charts/{id}/assets"
              >
                {$t('common.more')}
                <i class="fa-solid fa-angles-right"></i>
              </a>
              {#if $assets.data.data.length > 0}
                <div class="result">
                  {#each $assets.data.data.slice(0, 6) as chartAsset}
                    <ChartAsset {chartAsset} />
                  {/each}
                </div>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            </div>
          </div>
        </div>
      {/if}
      <Comments type="charts" id={chart.id} {searchParams} />
    </div>
    <div class="w-80 form-control mx-auto lg:mx-4">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('common.owner')}
        </span>
        {#if chart.ownerId}
          <User id={chart.ownerId} />
        {:else}
          <AnonymizationNotice />
        {/if}
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('song.song')}
        </span>
        <Song song={chart.song} />
      </div>
      {#if $collections.isSuccess}
        {#each $collections.data.data as collection}
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('chart.collection')}
            </span>
            <Collection {collection} />
          </div>
        {/each}
      {/if}
      {#if $leaderboard.isSuccess}
        {@const records = $leaderboard.data.data}
        {#if records.length > 0}
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('common.leaderboard')}
            </span>
            <div class="card w-80 bg-base-100 transition border-2 normal-border hover:shadow-lg">
              <div class="card-body px-4 py-6 gap-2 items-center justify-center">
                {#each records as record}
                  <Record {record} {chart} rank={record.position} showChart={false} />
                {/each}
                <a
                  class="min-w-fit btn btn-sm border-2 normal-border btn-outline self-end"
                  href="/charts/{id}/leaderboard"
                >
                  {$t('common.more')}
                  <i class="fa-solid fa-angles-right"></i>
                </a>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </div>
{:else if $chart.isError}
  <Error error={$chart.error} back="/charts" />
{:else}
  <div class="min-h-page skeleton" />
{/if}
