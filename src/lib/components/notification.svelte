<script lang="ts">
  import type { Notification } from '$lib/models';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  import { page } from '$app/stores';
  import { richtext } from '$lib/richtext';

  $: ({ api } = $page.data);

  export let notification: Notification;

  $: message = richtext(notification.message, api);
</script>

<div class="indicator w-full my-4">
  <span
    class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
  >
    {$t(`notification.type_${notification.type}`)}
  </span>
  <div
    class={`card w-full min-w-fit h-fit card-side bg-base-100 shadow-lg overflow-hidden ${
      notification.read_at ? 'border' : 'border border-secondary'
    }`}
  >
    <div class="card-body w-[60%]">
      <h2 class="text-xl mb-3 min-w-fit inline">
        {@html $message}
      </h2>
      <div class="flex items-center min-w-fit">
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('notification.notified_at')}
          </span>
          {parseDateTime(notification.notified_at)}
        </p>
        {#if notification.read_at}
          <p class="min-w-fit">
            <span class="badge badge-primary badge-outline mr-1">{$t('notification.read_at')}</span>
            {parseDateTime(notification.read_at)}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
