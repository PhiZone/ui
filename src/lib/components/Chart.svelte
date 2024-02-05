<script lang="ts">
  import type { ChartDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getLevelColor, getLevelDisplay } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import Like from './Like.svelte';
  import Rating from './Rating.svelte';
  import type { ChartAdmitteeDto } from '$lib/api/chart';

  export let chart: ChartDto | ChartAdmitteeDto;
  export let kind: 'full' | 'inline' = 'full';
  export let showSong = true;
  export let showCharter = true;
  export let showLike = true;

  $: charter = richtext(chart.authorName ?? '');
</script>

{#if kind === 'full'}
  <div
    class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
  >
    <a href={`/charts/${chart.id}`}>
      <figure class="h-[167px] relative">
        <img
          src={getCompressedImage(chart.illustration ?? chart.song.illustration)}
          alt="Illustration"
          class="object-fill"
        />
        <div class="absolute bottom-2 left-2 w-fit h-fit">
          <div class="join join-horizontal">
            <button
              class={`btn ${getLevelColor(chart.levelType)} btn-sm join-item text-xl no-animation`}
            >
              {chart.level}
              {getLevelDisplay(chart.difficulty)}
            </button>
            {#if chart.isRanked}
              <button
                class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg btn-sm join-item text-xl no-animation"
              >
                {$t('chart.ranked')}
              </button>
            {/if}
          </div>
        </div>
        {#if 'label' in chart && chart.label}
          <div class="absolute bottom-2 right-2">
            <div
              class={chart.label.length > 10 ? 'tooltip tooltip-bottom' : ''}
              data-tip={chart.label}
            >
              <button class="btn btn-sm btn-shallow btn-active no-animation join-item text-lg">
                {chart.label.length > 10 ? `${chart.label.substring(0, 10)}...` : chart.label}
              </button>
            </div>
          </div>
        {/if}
      </figure>
      <div class="card-body py-6 gap-0.5">
        <div class="w-full">
          <h2 class="title whitespace-nowrap overflow-hidden text-ellipsis">
            {chart.title ?? chart.song.title}
          </h2>
          <Rating rating={chart.rating} />
        </div>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.charter')}</span>
          {#if chart.authorName}
            {@html $charter}
          {:else}
            {$t('common.anonymous')}
          {/if}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.notes')}</span>
          {chart.noteCount}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.score')}</span>
          {chart.score.toFixed(2)}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge mr-1">{$t('chart.rating')}</span>
          {chart.rating.toFixed(2)}
        </p>
        {#if showLike}
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div
            class="absolute bottom-8 right-8"
            on:click={(e) => {
              e.preventDefault();
            }}
            on:keyup
          >
            <Like
              id={chart.id}
              likes={chart.likeCount}
              type="charts"
              liked={chart.dateLiked != null}
              class="btn-sm"
            />
          </div>
        {/if}
      </div>
    </a>
  </div>
{:else if kind === 'inline'}
  <a
    href="/charts/{chart.id}"
    class="w-full flex justify-between items-center gap-3 overflow-hidden px-5 h-16"
  >
    <div
      class="flex w-full {showCharter
        ? showSong
          ? 'lg:w-1/2 w-2/3'
          : 'lg:w-1/2 w-2/3 min-w-fit'
        : 'w-2/3'} gap-2"
    >
      {#if showSong || ('label' in chart && chart.label)}
        <div class="{showSong ? 'w-full sm:w-1/2 2xl:w-2/3' : 'w-1/6'} flex gap-2 items-center">
          {#if 'label' in chart && chart.label}
            <div
              class="{chart.label.length > 10 ? 'tooltip tooltip-right' : ''} hidden sm:inline"
              data-tip={chart.label}
            >
              <button class="btn btn-sm btn-shallow btn-active no-animation join-item text-lg">
                {chart.label.length > 10 ? `${chart.label.substring(0, 10)}...` : chart.label}
              </button>
            </div>
          {/if}
          {#if showSong}
            <p class="text-xl font-bold ellipsis-2-md max-w-fit">
              {chart.title ?? chart.song.title}
            </p>
          {/if}
        </div>
      {/if}
      <div class="{showSong ? 'hidden sm:flex' : ''} join join-horizontal items-center min-w-fit">
        <button class="btn {getLevelColor(chart.levelType)} btn-sm join-item text-lg no-animation">
          {chart.level}
          {getLevelDisplay(chart.difficulty)}
        </button>
        {#if chart.isRanked}
          <button
            class="btn btn-success dark:btn-outline dark:border-2 dark:bg-base-300 dark:bg-opacity-40 dark:backdrop-blur-lg btn-sm join-item text-lg no-animation"
          >
            {$t('chart.ranked')}
          </button>
        {/if}
      </div>
    </div>
    {#if showCharter}
      <div
        class="hidden md:inline lg:hidden xl:inline {showSong
          ? 'w-1/3 max-w-1/3'
          : 'w-3/4'} text-lg ellipsis-2-smxl"
      >
        {#if chart.authorName}
          {@html $charter}
        {:else}
          {$t('common.anonymous')}
        {/if}
      </div>
    {/if}
    <div class="w-1/6 flex gap-3 items-center justify-between min-w-fit">
      <div class="hidden md:inline">
        <Rating rating={chart.rating} direction="left" />
      </div>
      {#if showLike}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          on:click={(e) => {
            e.preventDefault();
          }}
          on:keyup
          class="hidden sm:inline"
        >
          <Like
            id={chart.id}
            likes={chart.likeCount}
            type="charts"
            liked={chart.dateLiked != null}
            class="btn-sm w-24"
          />
        </div>
      {/if}
    </div>
  </a>
{/if}

<style>
  .ellipsis-2-md {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 768px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .ellipsis-2-smxl {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 1100px) {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
