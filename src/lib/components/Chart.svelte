<script lang="ts">
  import type { ChartDto } from '$lib/api';
  import type { ChartAdmitteeDto } from '$lib/api/chart';

  import { richtext } from '$lib/richtext';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';

  import ChartLabel from './ChartDifficulty.svelte';
  import Like from './Like.svelte';
  import Rating from './Rating.svelte';

  interface Props {
    chart: ChartDto | ChartAdmitteeDto;
    kind?: 'full' | 'inline';
    showSong?: boolean;
    showCharter?: boolean;
    showLike?: boolean;
  }
  let {
    chart,
    kind = 'full',
    showSong = true,
    showCharter = true,
    showLike = true,
  }: Props = $props();

  let charter = $derived(richtext(chart.authorName ?? $t('common.anonymous')));
</script>

{#if kind === 'full'}
  <div
    class={'eventDescription' in chart && chart.eventDescription ? 'tooltip tooltip-bottom' : ''}
    data-tip={'eventDescription' in chart ? chart.eventDescription : ''}
  >
    <a
      class="card text-left w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
      href={`/charts/${chart.id}`}
    >
      <figure class="h-[167px] relative rounded-none">
        <img
          src={getCompressedImage(chart.illustration ?? chart.song.illustration)}
          alt="Illustration"
          class="object-fill"
        />
        <div class="absolute bottom-2 left-2 w-fit h-fit">
          <ChartLabel {chart} />
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
          <h2 class="title truncate">
            {chart.title ?? chart.song.title}
          </h2>
          <Rating rating={chart.rating} />
        </div>
        <p class="truncate">
          <span class="badge mr-1">{$t('chart.charter')}</span>
          {#if chart.authorName}
            {@html $charter}
          {:else}
            {$t('common.anonymous')}
          {/if}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('chart.note_count')}</span>
          {chart.noteCount}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('chart.score')}</span>
          {chart.score.toFixed(2)}
        </p>
        <p class="truncate">
          <span class="badge mr-1">{$t('chart.rating')}</span>
          {chart.rating.toFixed(2)}
        </p>
        {#if showLike}
          <div class="absolute bottom-8 right-8">
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
    class="w-full flex justify-between items-center gap-3 overflow-hidden px-5 h-16 {'eventDescription' in
      chart && chart.eventDescription
      ? 'tooltip tooltip-bottom'
      : ''}"
    data-tip={'eventDescription' in chart ? chart.eventDescription : ''}
  >
    <div
      class="flex w-full {showCharter
        ? showSong
          ? 'lg:w-1/2 w-2/3'
          : 'lg:w-1/2 w-2/3 min-w-fit'
        : 'w-2/3'} gap-2"
    >
      {#if showSong || ('label' in chart && chart.label)}
        <div
          class="{showSong
            ? 'sm:w-1/2 2xl:w-2/3'
            : showLike
              ? 'sm:w-5/12'
              : 'lg:w-1/2'} w-full flex gap-2 items-center"
        >
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
      <ChartLabel {chart} inline css={showSong ? 'hidden sm:flex' : ''} />
    </div>
    {#if showCharter}
      <div
        class="hidden lg:inline {showSong
          ? 'w-1/3 max-w-1/3'
          : showLike
            ? 'w-5/12'
            : 'w-1/2'} text-lg ellipsis-2-smxl"
      >
        {#if chart.authorName}
          {@html $charter}
        {:else}
          {$t('common.anonymous')}
        {/if}
      </div>
    {/if}
    {#if showLike}
      <div class="w-1/6 flex gap-3 items-center justify-between min-w-fit">
        <div class="hidden xl:inline">
          <Rating rating={chart.rating} direction="left" />
        </div>
        <div class="hidden sm:inline">
          <Like
            id={chart.id}
            likes={chart.likeCount}
            type="charts"
            liked={chart.dateLiked != null}
            class="btn-sm w-24"
          />
        </div>
      </div>
    {/if}
  </a>
{/if}

<style>
  .ellipsis-2-md {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 768px) {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  .ellipsis-2-smxl {
    overflow: hidden;
    text-overflow: ellipsis;
    @media (min-width: 1100px) {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
</style>
