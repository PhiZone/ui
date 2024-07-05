<script lang="ts">
  import type { EventDivisionDto } from '$lib/api/event.division';
  import type { EventDto } from '$lib/api/event';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import Like from './Like.svelte';

  export let division: EventDivisionDto;
  export let event: EventDto;
  export let showLike = true;
</script>

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

<style>
  .ellipsis-2 {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
</style>
