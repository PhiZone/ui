<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import Comments from '$lib/components/Comments.svelte';
  import Error from '$lib/components/Error.svelte';
  import EventDivision from '$lib/components/EventDivision.svelte';
  import Like from '$lib/components/Like.svelte';
  import Service from '$lib/components/Service.svelte';
  import User from '$lib/components/User.svelte';
  import { CREATE, HOSTSHIP, REMOVE, UPDATE } from '$lib/hostshipPermissions';
  import { t } from '$lib/translations/config';
  import { hasEventPermission } from '$lib/utils';

  export let data;

  $: ({ searchParams, id, user, api } = data);

  $: event = createQuery(api.event.info({ id }));
  $: divisions = createQuery(api.event.listDivisions({ id }));
  $: services = createQuery(api.service.list({ rangeResourceId: [id] }));
</script>

<svelte:head>
  <title>{$t('event.event')} - {$event.data?.data?.title} | {$t('common.site_name')}</title>
</svelte:head>

{#if $event.isSuccess}
  {@const event = $event.data.data}
  {@const hasHostshipPerm =
    hasEventPermission(user, event, CREATE, HOSTSHIP) ||
    hasEventPermission(user, event, UPDATE, HOSTSHIP) ||
    hasEventPermission(user, event, REMOVE, HOSTSHIP)}
  <input type="checkbox" id="illustration" class="modal-toggle" />
  <div class="modal">
    <div class="modal-box bg-base-100 p-0 max-w-fit aspect-video">
      <label
        for="illustration"
        class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      >
        ✕
      </label>
      <div class="absolute left-2 bottom-2">
        <div class="join join-horizontal">
          <div class="btn btn-secondary btn-xs join-item text-base no-animation">
            {$t('common.illustrator')}
          </div>
          <div class="btn btn-xs join-item text-base no-animation">
            {event.illustrator}
          </div>
        </div>
      </div>
      <img src={event.illustration} alt="Illustration" class="object-cover" />
    </div>
  </div>

  <div class="background min-h-screen" style:background-image="url({event.illustration})">
    <div class="hero-overlay bg-opacity-60"></div>
    <div class="pt-32 pb-24 w-full flex flex-col max-w-[1600px] px-4 md:px-32 mx-auto">
      <h1 class="text-7xl font-bold drop-shadow-xl text-neutral-content">
        {event.title}
      </h1>
      {#if event.subtitle}
        <h2 class="text-4xl font-bold drop-shadow-lg my-3 text-neutral-content">
          {event.subtitle}
        </h2>
      {/if}
      {#if event.description}
        <p class="text-xl mt-3 mb-6 content text-neutral-content">
          {event.description}
        </p>
      {/if}
      <div class="flex justify-between items-center flex-wrap">
        <div class="my-4 flex gap-3">
          <Like
            id={event.id}
            likes={event.likeCount}
            type="events"
            liked={event.dateLiked != null}
            class="btn-md w-36 text-lg border-neutral-content text-neutral-content btn-outline backdrop-blur"
          />
          <label
            for="illustration"
            class="btn border-2 border-neutral-content text-neutral-content btn-outline btn-md min-w-fit w-36 text-lg backdrop-blur"
          >
            {$t('common.view_illustration')}
          </label>
        </div>
        <div class="indicator my-4">
          <span
            class="indicator-item badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.owner')}
          </span>
          <div class="w-fit">
            <User id={event.ownerId} kind="mini" />
          </div>
        </div>
      </div>
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
          style:--tw-translate-x="0"
        >
          {$t('event.divisions')}
        </span>
        <div class="card w-full bg-base-100 transition border-2 normal-border hover:shadow-lg">
          <div class="card-body">
            {#if $divisions.isLoading}
              <ul class="menu bg-base-100 w-full">
                <li class="overflow-hidden">
                  <div class="w-full h-[82px] flex px-5">
                    <div class="w-1/2">
                      <div class="w-[300px] h-7 skeleton rounded"></div>
                    </div>
                    <div class="w-5/12">
                      <div class="w-[200px] h-7 skeleton rounded"></div>
                    </div>
                    <div class="w-1/12 min-w-fit">
                      <btn class="w-16 h-12 btn btn-sm" disabled></btn>
                    </div>
                  </div>
                </li>
              </ul>
            {:else if $divisions.isSuccess}
              {@const divisions = $divisions.data.data}
              {#if divisions.length > 0}
                <ul class="menu bg-base-100 w-full gap-2">
                  {#each divisions as division}
                    <li><EventDivision {division} {event} /></li>
                  {/each}
                </ul>
              {:else}
                <p class="py-3 text-center">{$t('common.empty')}</p>
              {/if}
            {/if}
          </div>
        </div>
      </div>
      {#if $services.isSuccess && $services.data.data.length > 0}
        {@const services = $services.data.data}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('common.services')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body pt-14 pb-10">
              <a
                class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
                href="/services?rangeResourceId={id}"
              >
                {$t('common.more')}
                <i class="fa-solid fa-angles-right"></i>
              </a>
              <div class="result">
                {#each services as service}
                  <Service {service} />
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
      {#if event.hosts.length > 0 || hasHostshipPerm}
        <div class="indicator w-full my-4">
          <span
            class="indicator-item indicator-start badge badge-neutral badge-lg min-w-fit text-lg"
            style:--tw-translate-x="0"
          >
            {$t('event.host_team')}
          </span>
          <div
            class="card flex-shrink-0 w-full border-2 normal-border transition hover:shadow-lg bg-base-100"
          >
            <div class="card-body {hasHostshipPerm ? 'pt-14 pb-10' : 'py-10'}">
              {#if hasHostshipPerm}
                <a
                  class="min-w-fit btn btn-sm border-2 normal-border btn-outline absolute right-2 top-2"
                  href="/events/{id}/host-team"
                >
                  {$t('common.manage')}
                  <i class="fa-solid fa-angles-right"></i>
                </a>
              {/if}
              <div class="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-2">
                {#each event.hosts as host}
                  <User id={host.id} initUser={host} kind="mini" showFollow={false} />
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}
      <Comments type="events" id={event.id} {searchParams} />
    </div>
  </div>
{:else if $event.isError}
  <Error error={$event.error} back="/events" />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}

<style>
</style>
