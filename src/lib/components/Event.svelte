<script lang="ts">
  import { page } from '$app/stores';
  import type { EventDto } from '$lib/api/event';
  import { t } from '$lib/translations/config';
  import { getCompressedImage } from '$lib/utils';
  import { createQuery } from '@tanstack/svelte-query';
  import Like from './Like.svelte';

  $: ({ api } = $page.data);

  export let event: EventDto;
  export let fixedHeight = true;
  export let showLike = true;

  $: owner = createQuery(api.user.info({ id: event.ownerId }));
</script>

<a
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
  href="/events/{event.id}"
>
  <figure class="h-[167px] relative">
    <img src={getCompressedImage(event.illustration)} alt="Illustration" class="object-fill" />
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="absolute bottom-2 right-2 flex gap-1"
      on:mouseenter={() => {
        console.log(event);
      }}
    >
      {#each event.divisions as division}
        <button
          class="btn btn-circle btn-xs w-[10px] btn-active no-animation {division.status == 2
            ? 'btn-success'
            : division.status == 3
              ? 'btn-error'
              : 'btn-ghost'}"
        ></button>
      {/each}
    </div>
  </figure>
  <div class="card-body {fixedHeight ? 'h-[244px]' : ''} py-6 gap-0.5">
    <div class="flex flex-col mb-2">
      <h2 class="title-strong w-full truncate">
        {event.title}
      </h2>
      {#if event.subtitle}
        <h2 class="subtitle opacity-80 w-full truncate">
          {event.subtitle}
        </h2>
      {/if}
    </div>
    <p class="flex items-center gap-1">
      <span class="badge">{$t('common.illustrator')}</span>
      <span class="truncate">
        {event.illustrator}
      </span>
    </p>
    <p class="flex items-center gap-1">
      <span class="badge">{$t('common.owner')}</span>
      {#if $owner.isSuccess}
        <span class="truncate">
          {$owner.data.data.userName}
        </span>
      {:else}
        <span class="skeleton w-2/3 h-6"></span>
      {/if}
    </p>
    {#if event.description}
      <p class="flex items-center">
        <span class="description">
          <span class="inline-flex badge mr-1">{$t('common.description')}</span>
          {event.description}
        </span>
      </p>
    {/if}
    {#if showLike}
      <div class="card-actions justify-end">
        <Like
          id={event.id}
          likes={event.likeCount}
          type="events"
          liked={event.dateLiked != null}
          class="btn-sm"
        />
      </div>
    {/if}
  </div>
</a>
