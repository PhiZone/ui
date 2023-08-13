<script lang="ts">
  import type { SongDto } from '$lib/models';
  import { t } from '$lib/translations/config';
  import { convertDuration } from '$lib/utils';
  import Like from './Like.svelte';

  export let song: SongDto;
  export let kind: 'full' | 'inline' = 'full';

  // let easyCount = song.levels.find((e) => {
  //     return e.level === 'EZ';
  //   })?.count,
  //   hardCount = song.levels.find((e) => {
  //     return e.level === 'HD';
  //   })?.count,
  //   insaneCount = song.levels.find((e) => {
  //     return e.level === 'IN';
  //   })?.count,
  //   anotherCount = song.levels.find((e) => {
  //     return e.level === 'AT';
  //   })?.count,
  //   specialCount = song.levels.find((e) => {
  //     return e.level === 'SP';
  //   })?.count,
  //   otherCount = song.levels.length
  //     ? (typeof song.charts == 'object' ? song.charts.length : song.charts) -
  //       (easyCount ? easyCount : 0) -
  //       (hardCount ? hardCount : 0) -
  //       (insaneCount ? insaneCount : 0) -
  //       (anotherCount ? anotherCount : 0) -
  //       (specialCount ? specialCount : 0)
  //     : 0;
</script>

{#if kind === 'full'}
  <div class="card w-80 bg-base-100 hover:shadow-primary-content shadow-lg overflow-hidden">
    <a href={`/songs/${song.id}`}>
      <figure class="h-[180px] relative">
        <img src={song.illustration} alt="Illustration" class="object-fill" />
        {#if song.isOriginal}
          <div class="absolute bottom-2 left-2 w-full flex gap-1 align-middle">
            <button class="btn btn-secondary btn-sm text-xl no-animation">
              {$t('song.original')}
            </button>
          </div>
        {/if}
      </figure>
      <div class="card-body gap-0.5">
        <h2 class="title w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {song.title}
        </h2>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('song.edition')}</span>
          {song.edition}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('song.composer')}</span>
          {song.authorName}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('song.illustrator')}</span>
          {song.illustrator}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('song.bpm')}</span>
          {song.bpm}
        </p>
        <p class="whitespace-nowrap overflow-hidden text-ellipsis">
          <span class="badge badge-primary badge-outline mr-1">{$t('song.duration')}</span>
          {convertDuration(song.duration)}
        </p>
        <!-- <p class="whitespace-nowrap overflow-hidden text-ellipsis">
        <span class="badge badge-primary badge-outline mr-1">
          {$t(song.original ? 'song.author' : 'song.uploader')}
        </span>
        {song.uploader.username}
      </p> -->
        <p />
        <div class="card-actions flex items-center justify-end">
          <!-- {#if easyCount}
          <a href={`/charts?song=${song.id}&level=EZ`}>
            <button class="btn btn-sm btn-primary btn-outline gap-2">
              EZ ({easyCount})
            </button>
          </a>
        {/if}
        {#if hardCount}
          <a href={`/charts?song=${song.id}&level=HD`}>
            <button class="btn btn-sm btn-primary btn-outline gap-2">
              HD ({hardCount})
            </button>
          </a>
        {/if}
        {#if insaneCount}
          <a href={`/charts?song=${song.id}&level=IN`}>
            <button class="btn btn-sm btn-primary btn-outline gap-2">
              IN ({insaneCount})
            </button>
          </a>
        {/if}
        {#if anotherCount}
          <a href={`/charts?song=${song.id}&level=AT`}>
            <button class="btn btn-sm btn-primary btn-outline gap-2">
              AT ({anotherCount})
            </button>
          </a>
        {/if}
        {#if specialCount}
          <a href={`/charts?song=${song.id}&level=SP`}>
            <button class="btn btn-sm btn-primary btn-outline gap-2">
              SP ({specialCount})
            </button>
          </a>
        {/if}
        {#if otherCount}
          <a href={`/charts?song=${song.id}`}>
            <button class="btn btn-sm btn-primary btn-outline gap-2">
              OTH ({otherCount})
            </button>
          </a>
        {/if} -->

          <div
            on:click={(e) => {
              e.preventDefault();
            }}
            on:keyup
          >
            <Like id={song.id} likes={song.likeCount} type="songs" class="btn-sm" />
          </div>
        </div>
      </div>
    </a>
  </div>
{:else if kind === 'inline'}
  <a href="/songs/{song.id}" class="w-full overflow-hidden flex px-5 h-16">
    <div class="w-11/12 md:w-1/2">
      <div class="text-xl font-bold">
        {song.title}
        {#if song.isOriginal}
          <button class="btn btn-secondary btn-sm text-lg no-animation">
            {$t('song.original')}
          </button>
        {/if}
      </div>
    </div>
    <div class="w-0 md:w-5/12">
      <div class="text-lg hidden md:flex">
        {song.authorName}
      </div>
    </div>
    <div
      class="w-1/12 min-w-fit"
      on:click={(e) => {
        e.preventDefault();
      }}
      on:keyup
    >
      <Like id={song.id} likes={song.likeCount} type="songs" class="btn-sm w-24" />
    </div>
  </a>
{/if}

<style>
  .title {
    gap: 0.5rem /* 8px */;
    font-size: 1.25rem /* 20px */;
    line-height: 1.75rem /* 28px */;
    font-weight: 600;
    margin-bottom: 4px;
  }
</style>
