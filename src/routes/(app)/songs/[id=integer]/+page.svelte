<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { t } from '$lib/translations/config';
  import { convertDuration, parseDuration, parseLyrics, parseDateTime } from '$lib/utils';
  import Comments from '$lib/components/Comments.svelte';
  import User from '$lib/components/User.svelte';
  import Like from '$lib/components/Like.svelte';
  import Chapter from '$lib/components/Chapter.svelte';
  import Player from '$lib/components/SongPlayer.svelte';
  import Chart from '$lib/components/Chart.svelte';

  export let data;

  $: ({ searchParams, id, user, api } = data);

  $: song = createQuery(api.song.info({ id }));
  $: charts = createQuery(api.chart.listAll({ song: id }));
  $: chapters = createQuery(api.chapter.listAll({}, { enabled: false }));
</script>

<svelte:head>
  <title>{$t('song.song')} - {$song.data?.name} | {$t('common.title')}</title>
</svelte:head>

{#if $song.isSuccess}
  {@const song = $song.data}
  <div class="info-page">
    <div class="mx-4 min-w-[540px] max-w-7xl main-width">
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
        >
          {$t('song.song')}
        </span>
        <div class="card flex-shrink-0 w-full shadow-lg bg-base-100">
          <div class="card-body py-10">
            <div class="text-5xl py-3 flex font-bold items-center">
              {song.name}
              {#if song.original}
                <button class="ml-2 btn btn-secondary btn-sm text-xl no-animation">
                  {$t('song.original')}
                </button>
              {/if}
            </div>
            <div class="flex">
              <div class="w-1/3">
                <div class="info">
                  <div class="form-control gap-1">
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">{$t('song.id')}</span>
                      {song.id}
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">
                        {$t('song.edition')}
                      </span>
                      {song.edition}
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">
                        {$t('song.composer')}
                      </span>
                      {song.composer}
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">
                        {$t('song.illustrator')}
                      </span>
                      {song.illustrator}
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">{$t('song.bpm')}</span>
                      {song.bpm}
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">
                        {$t('song.offset')}
                      </span>
                      {song.offset}ms
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">
                        {$t('song.duration')}
                      </span>
                      {convertDuration(song.duration)}
                    </p>
                    <p>
                      <span class="badge badge-primary badge-outline mr-1">{$t('song.time')}</span>
                      {parseDateTime(song.time)}
                    </p>
                    {#if song.description && song.description.length < 172}
                      <p class="content">
                        <span class="badge badge-primary badge-outline mr-1">
                          {$t('common.description')}
                        </span>
                        {song.description}
                      </p>
                    {/if}
                  </div>
                </div>
                <div class="flex gap-2 items-end w-full justify-start">
                  <Like
                    id={song.like}
                    likes={song.like_count}
                    type="song"
                    target={song.id}
                    class="btn-md"
                  />
                  {#if user}
                    <a href={song.song} target="_blank" rel="noreferrer" download>
                      <button class="btn btn-primary btn-outline flex gap-1">
                        <svg
                          fill="currentColor"
                          width="14px"
                          height="28px"
                          viewBox="0 0 16 32"
                          version="1.1"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.48 17.6c-0.48 0-0.84 0.36-0.84 0.84v3.92c0 0.48-0.36 0.84-0.84 0.84h-9.28c-0.48 0-0.84-0.36-0.84-0.84v-3.92c0-0.44-0.36-0.84-0.84-0.84s-0.84 0.4-0.84 0.84v3.92c0 1.4 1.12 2.52 2.52 2.52h9.28c1.4 0 2.52-1.12 2.52-2.52v-3.92c0-0.44-0.36-0.84-0.84-0.84zM6.56 18.48c0.040 0.040 0.2 0.28 0.6 0.28s0.56-0.24 0.6-0.28l3.52-3.52c0.32-0.32 0.32-0.84 0-1.2-0.32-0.32-0.84-0.32-1.2 0l-2.080 2.12v-7.92c0-0.48-0.36-0.84-0.84-0.84s-0.84 0.36-0.84 0.84v7.92l-2.080-2.080c-0.32-0.32-0.84-0.32-1.2 0-0.32 0.32-0.32 0.84 0 1.2l3.52 3.48z"
                          />
                        </svg>
                        {$t('common.download')}
                      </button>
                    </a>
                  {/if}
                </div>
              </div>
              <div class="w-2/3 float-right">
                <Player
                  song={song.song}
                  illustration={song.illustration}
                  duration={parseDuration(song.duration)}
                  lyrics={song.lyrics ? parseLyrics(song.lyrics) : null}
                />
              </div>
            </div>
            {#if song.description && song.description.length >= 172}
              <p class="mt-2 content">
                <span class="badge badge-primary badge-outline mr-1">
                  {$t('common.description')}
                </span>
                {song.description}
              </p>
            {/if}
            {#if $charts.isSuccess}
              <div class="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box">
                <input type="checkbox" />
                <div class="collapse-title text-base text-center">{$t('song.charts')}</div>
                <div class="collapse-content">
                  {#if $charts.isSuccess}
                    {@const charts = $charts.data}
                    {#if charts.length > 0}
                      <ul class="menu">
                        {#each charts as chart}
                          <li class="hover-bordered"><Chart {chart} kind="inline" /></li>
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
      <Comments type="song" {id} {searchParams} />
    </div>
    <div class="mx-4 w-80 form-control">
      <div class="indicator my-4 w-full">
        <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
          {$t(song.original ? 'song.author' : 'song.uploader')}
        </span>
        <User id={song.uploader} />
      </div>
      {#if $chapters.isSuccess}
        {#each $chapters.data as chapter}
          <div class="indicator my-4 w-full">
            <span class="indicator-item badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg">
              {$t('song.chapter')}
            </span>
            <Chapter {chapter} />
          </div>
        {/each}
      {/if}
    </div>
  </div>
{/if}

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }

  .main-width {
    width: calc(100% - 80px);
  }

  .info {
    height: calc(100% - 48px);
  }
</style>
