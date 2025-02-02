<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';

  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import Timer from '$lib/components/Timer.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { getAvatar } from '$lib/utils';

  export let data;
  $: ({ user, api, code, url } = data);

  $: query = createQuery(api.event.infoInvite({ code }));

  const maxMemberDisplay = 6;

  let status = Status.WAITING;
  let errorCode = '';

  let timeUp = false;

  $: if (!user && browser) {
    goto(`/session/login?redirect=${url.pathname + url.search}`);
  }
</script>

<svelte:head>
  <title>
    {$t('event.team.invitation.invitation')} | {$t('event.event')} - {$query.data?.data.event.title}
    | {$t('common.site_name')}
  </title>
</svelte:head>

<div class="hero min-h-screen bg-base-300">
  <div class="hero-content text-center">
    {#if $query.isSuccess}
      {@const event = $query.data.data.event}
      {@const inviter = $query.data.data.inviter}
      {@const alreadyJoined = event.hosts.some((e) => e.id === user?.id)}
      <div class="flex flex-col gap-8 items-center">
        <div class="flex gap-2 md:gap-4">
          <div class="avatar">
            <div class="mask mask-circle w-16 h-16 md:w-24 md:h-24">
              <img src={getAvatar(inviter.avatar)} alt="Avatar" />
            </div>
          </div>
          <div class="divider divider-horizontal"></div>
          <div class="avatar">
            <div class="mask mask-circle w-16 h-16 md:w-24 md:h-24">
              <img src={getAvatar(event.illustration)} alt="Illustration" />
            </div>
          </div>
        </div>
        <p class="font-bold text-lg md:text-2xl">
          {$t('event.hostship.invite_msg_brief', {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            user: inviter.userName,
            event: event.title,
          })}
        </p>
        <div class="avatar-group -space-x-3 rtl:space-x-reverse md:hidden">
          {#each event.hosts.slice(0, maxMemberDisplay) as participant}
            <div class="avatar">
              <div class="mask mask-circle w-8 h-8">
                <img src={getAvatar(participant.avatar)} alt="Avatar" />
              </div>
            </div>
          {/each}
          {#if event.hosts.length > maxMemberDisplay}
            <div class="avatar placeholder">
              <div class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content">
                <span>+{event.hosts.length - maxMemberDisplay}</span>
              </div>
            </div>
          {/if}
        </div>
        <div class="md:avatar-group -space-x-3 rtl:space-x-reverse hidden lg:hidden">
          {#each event.hosts.slice(0, maxMemberDisplay * 2) as participant}
            <div class="avatar">
              <div class="mask mask-circle w-8 h-8">
                <img src={getAvatar(participant.avatar)} alt="Avatar" />
              </div>
            </div>
          {/each}
          {#if event.hosts.length > maxMemberDisplay * 2}
            <div class="avatar placeholder">
              <div class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content">
                <span>+{event.hosts.length - maxMemberDisplay * 2}</span>
              </div>
            </div>
          {/if}
        </div>
        <div class="lg:avatar-group -space-x-3 rtl:space-x-reverse hidden xl:hidden">
          {#each event.hosts.slice(0, maxMemberDisplay * 5) as participant}
            <div class="avatar">
              <div class="mask mask-circle w-8 h-8">
                <img src={getAvatar(participant.avatar)} alt="Avatar" />
              </div>
            </div>
          {/each}
          {#if event.hosts.length > maxMemberDisplay * 5}
            <div class="avatar placeholder">
              <div class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content">
                <span>+{event.hosts.length - maxMemberDisplay * 5}</span>
              </div>
            </div>
          {/if}
        </div>
        <div class="xl:avatar-group -space-x-3 rtl:space-x-reverse hidden">
          {#each event.hosts.slice(0, maxMemberDisplay * 8) as participant}
            <div class="avatar">
              <div class="mask mask-circle w-8 h-8">
                <img src={getAvatar(participant.avatar)} alt="Avatar" />
              </div>
            </div>
          {/each}
          {#if event.hosts.length > maxMemberDisplay * 8}
            <div class="avatar placeholder">
              <div class="mask mask-circle w-8 h-8 bg-neutral text-neutral-content">
                <span>+{event.hosts.length - maxMemberDisplay * 8}</span>
              </div>
            </div>
          {/if}
        </div>
        <Timer
          timeDue={new Date($query.data.data.dateExpired)}
          text="common.valid_through"
          bind:timeUp
        />
        {#if alreadyJoined}
          <div class="flex flex-col gap-8">
            <p class="font-bold text-lg md:text-2xl">
              {$t('event.hostship.already_joined')}
            </p>
          </div>
        {:else}
          <div class="flex flex-col gap-2">
            <div
              class={status === Status.ERROR && errorCode
                ? 'tooltip tooltip-open tooltip-bottom tooltip-error'
                : ''}
              data-tip={errorCode
                ? $t(
                    errorCode === 'InvalidOperation'
                      ? 'event.hostship.already_joined'
                      : errorCode === 'ResourceNotFound'
                        ? 'event.team.invitation.code_invalid'
                        : `error.${errorCode}`,
                  )
                : ''}
            >
              <button
                class="btn btn-lg {status === Status.ERROR
                  ? 'btn-error'
                  : status === Status.SENDING
                    ? 'btn-ghost'
                    : 'btn-outline border-2 normal-border'} w-full"
                disabled={status === Status.SENDING || timeUp}
                on:click={async () => {
                  status = Status.SENDING;
                  errorCode = '';
                  const resp = await api.event.acceptInvite({ code });
                  if (resp.ok) {
                    goto(
                      `/events/${event.id}?level=success&message=${$t('event.hostship.joined', {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        event: event.title,
                      })}`,
                    );
                  } else {
                    status = Status.ERROR;
                    const data = await resp.json();
                    errorCode = data.code;
                  }
                }}
              >
                {status === Status.ERROR
                  ? $t('common.error')
                  : status === Status.SENDING
                    ? $t('common.waiting')
                    : $t('event.hostship.join')}
              </button>
            </div>
          </div>
        {/if}
      </div>
    {:else if $query.isError}
      <div class="flex flex-col gap-8">
        <p class="font-bold text-lg md:text-2xl">{$t('event.team.invitation.code_invalid')}</p>
        <a href="/" class="btn border-2 normal-border btn-outline btn-lg m-2">
          {$t('common.back_to_homepage')}
        </a>
      </div>
    {:else}
      <div class="flex flex-col gap-8">
        <div class="flex gap-4 justify-center">
          <div class="avatar">
            <div class="mask mask-circle skeleton w-24 h-24"></div>
          </div>
          <div class="divider divider-horizontal opacity-0"></div>
          <div class="avatar">
            <div class="mask mask-circle skeleton w-24 h-24"></div>
          </div>
        </div>
        <p class="font-bold text-lg md:text-2xl skeleton h-8 w-full"></p>
      </div>
    {/if}
  </div>
</div>
