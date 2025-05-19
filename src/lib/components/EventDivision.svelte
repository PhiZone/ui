<script lang="ts">
  import type { EventDivisionDto } from '$lib/api/event';
  import type { EventDto } from '$lib/api/event';

  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';

  import Like from './Like.svelte';

  interface Props {
    kind?: 'inline' | 'full';
    division: EventDivisionDto;
    event: EventDto;
    showLike?: boolean;
  }
  let { kind = 'inline', division, event, showLike = true }: Props = $props();
</script>

{#if kind === 'inline'}
  <a
    href="/events/divisions/{division.id}"
    class="w-full overflow-hidden flex px-5 h-24 border-2 normal-border hover:shadow-lg hover:border-secondary"
  >
    <img
      class="object-cover w-full h-full blur-lg opacity-40"
      src={getCompressedImage(division?.illustration ?? event.illustration, 1)}
      alt="Illustration"
    />
    <div class="absolute left-4 w-2/3 lg:w-full">
      <div class="flex gap-2 items-center">
        <button class="btn btn-sm btn-shallow btn-active no-animation join-item text-lg">
          {$t(`event.division.types.${division.type}`)}
        </button>
        <div class="flex flex-col gap-1 ellipsis-2 max-w-fit">
          <p class="text-xl font-bold">
            {division.title}
          </p>
          {#if division.subtitle}
            <p class="text-lg">
              {division.subtitle}
            </p>
          {/if}
        </div>
      </div>
    </div>
    <div class="absolute right-4 flex gap-3 items-center">
      <p class="hidden md:flex items-center gap-1">
        <span class="truncate">
          <span class="text-lg font-extrabold">{division.teamCount}</span>
          /
          {#if division.maxTeamCount}
            {division.maxTeamCount}
          {:else}
            ∞
          {/if}
        </span>
      </p>
      <div
        class="badge badge-lg badge-outline {division.status == 2
          ? 'badge-success'
          : division.status == 3
            ? 'badge-error'
            : ''}"
      >
        {$t(`event.division.statuses.${division.status}`)}
      </div>
      {#if showLike}
        <div class="hidden lg:inline">
          <Like
            id={division.id}
            likes={division.likeCount}
            type="events/divisions"
            liked={division.dateLiked != null}
            class="btn-sm w-24"
          />
        </div>
      {/if}
    </div>
  </a>
{:else}
  <a
    class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
    href="/events/divisions/{division.id}"
  >
    <figure class="h-[167px] relative">
      <img
        src={getCompressedImage(division.illustration ?? event.illustration)}
        alt="Illustration"
        class="object-fill"
      />
      <div class="absolute bottom-2 left-2">
        <button class="btn btn-shallow btn-sm text-xl no-animation">
          {$t(`event.division.types.${division.type}`)}
        </button>
      </div>
      <div
        class="absolute bottom-2 right-2 badge badge-lg badge-outline backdrop-blur-md {division.status ==
        2
          ? 'badge-success'
          : division.status == 3
            ? 'badge-error'
            : ''}"
      >
        {$t(`event.division.statuses.${division.status}`)}
      </div>
    </figure>
    <div class="card-body py-6 gap-0.5">
      <div class="flex flex-col mb-2">
        <h2 class="title-strong w-full truncate">
          {event.title} / {division.title}
        </h2>
        {#if division.subtitle}
          <h2 class="subtitle opacity-80 w-full truncate">
            {division.subtitle}
          </h2>
        {/if}
      </div>
      <p class="flex items-center gap-1">
        <span class="badge">{$t('common.illustrator')}</span>
        <span class="truncate">
          {division.illustrator ?? event.illustrator}
        </span>
      </p>
      {#if division.description}
        <p class="flex items-center">
          <span class="description">
            <span class="inline-flex badge mr-1">{$t('common.description')}</span>
            {division.description}
          </span>
        </p>
      {/if}
      {#if showLike}
        <div class="card-actions justify-end">
          <Like
            id={division.id}
            likes={division.likeCount}
            type="events/divisions"
            liked={division.dateLiked != null}
            class="btn-sm"
          />
        </div>
      {/if}
    </div>
  </a>
{/if}

<style>
  .ellipsis-2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
