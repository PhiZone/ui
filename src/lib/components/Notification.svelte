<script lang="ts">
  import type { NotificationDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  import { richtext } from '$lib/richtext';
  import User from './User.svelte';
  import { page } from '$app/stores';
  import { invalidateAll } from '$app/navigation';

  $: ({ user, api } = $page.data);

  export let notification: NotificationDto;

  $: content = richtext(notification.content);
</script>

<div class="indicator w-full my-4">
  <span
    class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit text-lg"
    style:--tw-translate-x="0"
  >
    {$t(`notification.types.${notification.type}`)}
  </span>
  <div
    class={`card w-full min-w-fit h-fit card-side bg-base-100 transition hover:shadow-lg overflow-hidden border-2 ${
      notification.dateRead ? 'border-gray-700' : 'border-secondary'
    }`}
  >
    <figure class="w-1/4 xs:w-1/6">
      <div
        class="relative inline-flex flex-col items-center justify-center border-r border-gray-700 px-3 py-3 mx-auto my-auto w-full"
      >
        <User
          id={notification.operator?.id ?? 1}
          initUser={notification.operator ?? undefined}
          kind="embedded"
        />
      </div>
    </figure>
    <div class="card-body w-3/4 md:w-5/6 pt-4 pl-6 pb-4 pr-6 flex-col justify-center">
      <div class="flex justify-between items-center">
        <div class="flex flex-col w-full">
          <h2 class="text-xl mb-3 inline">
            {@html $content}
          </h2>
          <div class="flex gap-2 flex-col sm:flex-row">
            <p class="min-w-fit">
              <span class="badge mr-1">
                {$t('notification.notified_at')}
              </span>
              {parseDateTime(notification.dateCreated, true, user?.language)}
            </p>
            {#if notification.dateRead}
              <p class="min-w-fit">
                <span class="badge mr-1">
                  {$t('notification.read_at')}
                </span>
                {parseDateTime(notification.dateRead, true, user?.language)}
              </p>
            {/if}
          </div>
        </div>
        <button
          class="btn border-2 hover:btn-outline {notification.dateRead ? 'hidden' : ''}"
          on:click={async () => {
            notification.dateRead = new Date();
            const resp = await api.notification.read({ id: notification.id });
            if (resp.ok) {
              invalidateAll();
            } else {
              console.error(await resp.json());
            }
          }}
        >
          {$t('notification.read_v')}
        </button>
      </div>
    </div>
  </div>
</div>
