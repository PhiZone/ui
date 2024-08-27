<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { convertTime, parseTime, parseLyrics, parseDateTime } from '$lib/utils';
  import Comments from '$lib/components/Comments.svelte';
  import User from '$lib/components/User.svelte';
  import Like from '$lib/components/Like.svelte';
  import Chapter from '$lib/components/Chapter.svelte';
  import Player from '$lib/components/SongPlayer.svelte';
  import Chart from '$lib/components/Chart.svelte';
  import { richtext } from '$lib/richtext';
  import { readable } from 'svelte/store';
  import Error from '$lib/components/Error.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import AnonymizationNotice from '$lib/components/AnonymizationNotice.svelte';
  import Download from '$lib/components/Download.svelte';

  export let data;

  $: ({ searchParams, id, user, api } = data);

  $: song = createQuery(api.song.info({ id }));
  $: charts = createQuery(api.chart.listAll({ rangeSongId: [id] }));
  $: chapters = createQuery(api.song.listAllAdmitters({ id }));
  $: authorships = createQuery(api.authorship.listAll({ rangeResourceId: [id] }));
  $: composer =
    $song.data?.data.isOriginal && $song.data?.data.authorName
      ? richtext($song.data?.data.authorName)
      : readable($song.data?.data.authorName ?? $t('common.anonymous'));
  $: composerText =
    $song.data?.data.isOriginal && $song.data?.data.authorName
      ? $song.data?.data.authorName.replaceAll(
          /\[PZUser(Mention)?:(\d+):(.+?):PZRT\]/gi,
          (_, __, ___, display: string) => display,
        )
      : $song.data?.data.authorName;
</script>

<svelte:head>
  <title>{$t('song.song')} - {$song.data?.data.title} | {$t('common.title')}</title>
</svelte:head>

{#if $song.isSuccess}
  {@const song = $song.data.data}

  <input type="checkbox" id="license-{song.id}" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box text-left min-w-fit">
      <label
        for="license-{song.id}"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="py-3 flex gap-4 items-center content">
        {#if song.isOriginal}
          <button class="btn btn-shallow text-3xl cursor-default no-animation min-w-fit">
            {$t('song.original')}
          </button>
        {/if}
        <span class="text-5xl font-bold">{song.title}</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="btn btn-accent btn-sm text-xl cursor-default no-animation">
          {$t(`song.edition_types.${song.editionType}`)}
        </button>
        {#if song.edition}
          <p class="text-2xl font-semibold">
            {song.edition}
          </p>
        {/if}
      </div>
      <p class="py-4">
        {$t(`song.edition_type_tips.${song.editionType}`)}
      </p>
      {#if song.license}
        <img src={song.license} alt="License" />
      {/if}
    </div>
  </div>

  <div class="info-page">
    <div class="mx-4 min-w-[300px] max-w-7xl">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('song.song')}
        </span>
        <div
          class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
        >
          <div class="card-body py-10">
            <div class="py-3 flex flex-col sm:flex-row gap-4 items-center">
              {#if song.isOriginal}
                <button class="btn btn-accent text-3xl cursor-default no-animation min-w-fit">
                  {$t('song.original')}
                </button>
              {/if}
              <h2 class="text-5xl font-bold content md:inline-block">
                {song.title}
              </h2>
            </div>
            <div class="flex gap-2 flex-col lg:flex-row">
              <div class="lg:w-1/3">
                <div class="info">
                  <div class="form-control gap-1">
                    <p>
                      <span class="badge mr-1">
                        {$t('song.edition')}
                      </span>
                      <label
                        for="license-{song.id}"
                        class="btn btn-xs btn-shallow text-sm font-normal"
                      >
                        {$t(`song.edition_types.${song.editionType}`)}
                      </label>
                      {#if song.edition}
                        {song.edition}
                      {/if}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('song.composer')}
                      </span>
                      {@html $composer}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('common.illustrator')}
                      </span>
                      {song.illustrator}
                    </p>
                    <p>
                      <span class="badge mr-1">{$t('song.bpm')}</span>
                      {song.bpm}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('song.duration')}
                      </span>
                      {convertTime(song.duration, true)}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('song.offset')}
                      </span>
                      {song.offset} ms
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('common.date_created')}
                      </span>
                      {parseDateTime(song.dateCreated)}
                    </p>
                    <p>
                      <span class="badge mr-1">
                        {$t('common.date_updated')}
                      </span>
                      {parseDateTime(song.dateUpdated)}
                    </p>
                    {#if song.description && song.description.length < 172}
                      <p class="content">
                        <span class="badge mr-1">
                          {$t('common.description')}
                        </span>
                        {song.description}
                      </p>
                    {/if}
                    {#if song.tags.length > 0}
                      <p class="inline-flex gap-1 flex-wrap">
                        <span class="badge">
                          {$t('common.tags')}
                        </span>
                        {#each song.tags as tag}
                          <Tag {tag} />
                        {/each}
                      </p>
                    {/if}
                  </div>
                </div>
                <div
                  class="mb-2 flex items-end w-full justify-center {user
                    ? 'join join-horizontal'
                    : ''}"
                >
                  <Like
                    id={song.id}
                    likes={song.likeCount}
                    type="songs"
                    liked={song.dateLiked != null}
                    class="btn-md {user ? 'join-item' : ''}"
                  />
                  {#if user}
                    <Download
                      file={song.file}
                      name={`${composerText} - ${song.title}${
                        song.edition ? ` (${song.edition})` : ''
                      }`}
                      class="btn-md join-item"
                    />
                  {/if}
                </div>
              </div>
              <div class="lg:w-2/3">
                <Player
                  song={song.file}
                  illustration={song.illustration}
                  duration={parseTime(song.duration)}
                  lyrics={song.lyrics ? parseLyrics(song.lyrics) : null}
                />
              </div>
            </div>
            {#if song.description && song.description.length >= 172}
              <p class="mt-2 content">
                <span class="badge mr-1">
                  {$t('common.description')}
                </span>
                {song.description}
              </p>
            {/if}
            {#if $charts.isSuccess}
              <div
                class="collapse collapse-arrow transition border-2 normal-border hover:border-secondary bg-base-100 rounded-box mt-3"
              >
                <input type="checkbox" />
                <div class="collapse-title text-base text-center">{$t('song.charts')}</div>
                <div class="collapse-content">
                  {#if $charts.isSuccess}
                    {@const charts = $charts.data.data}
                    {#if charts.length > 0}
                      <ul class="menu">
                        {#each charts as chart}
                          <li>
                            <Chart {chart} kind="inline" showSong={false} />
                          </li>
                        {/each}
                      </ul>
                    {:else}
                      <p class="py-3 text-center">{$t('common.empty')}</p>
                    {/if}
                  {:else}
                    <p class="py-3 text-center">{$t('common.loading')}</p>
                  {/if}
                </div>
              </div>
            {/if}
          </div>
        </div>
      </div>
      {#if $authorships.isSuccess && $authorships.data.data.length > 0 && song.isOriginal}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('song.composer')}
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
      <Comments type="songs" {id} {searchParams} />
    </div>
    <div class="mx-auto lg:mx-4 w-80 form-control">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t(song.isOriginal ? 'song.author' : 'song.uploader')}
        </span>
        {#if song.ownerId}
          <User id={song.ownerId} />
        {:else}
          <AnonymizationNotice />
        {/if}
      </div>
      {#if $chapters.isSuccess}
        {#each $chapters.data.data as chapter}
          <div class="indicator w-full my-4">
            <span
              class="indicator-item indicator-start lg:indicator-end badge badge-neutral badge-lg min-w-fit text-lg"
              style:--tw-translate-x="0"
            >
              {$t('song.chapter')}
            </span>
            <Chapter {chapter} />
          </div>
        {/each}
      {/if}
    </div>
  </div>
{:else if $song.isError}
  <Error error={$song.error} back="/songs" />
{:else}
  <div class="min-h-page skeleton" />
{/if}

<style>
  .info {
    height: calc(100% - 48px);
  }
</style>
