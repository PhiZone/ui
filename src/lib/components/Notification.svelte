<script lang="ts">
  import type { NotificationDto } from '$lib/api';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';
  // import { page } from '$app/stores';
  import { richtext } from '$lib/richtext';
  import User from './User.svelte';

  // $: ({ api } = $page.data);

  export let notification: NotificationDto;

  $: content = richtext(notification.content);
</script>

<div class="indicator w-full my-4">
  <span
    class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
  >
    {$t(`notification.types.${notification.type}`)}
  </span>
  <div
    class={`card w-full min-w-fit h-fit card-side bg-base-100 shadow-lg overflow-hidden ${
      notification.dateRead &&
      new Date().getTime() - new Date(notification.dateRead).getTime() > 2500
        ? 'border'
        : 'border border-secondary'
    }`}
  >
    <figure class="w-1/4 xs:w-1/6">
      <div
        class="relative inline-flex flex-col items-center justify-center border-r border-base-200 px-3 py-3 mx-auto my-auto w-full"
      >
        <User id={notification.operator.id ?? 1} initUser={notification.operator} kind="embedded" />
      </div>
    </figure>
    <div class="card-body w-3/4 md:w-5/6 pt-4 pl-6 pb-4 pr-6 flex-col justify-center">
      <h2 class="text-xl mb-3 min-w-fit inline">
        {@html $content}
      </h2>
      <div class="flex items-center min-w-fit">
        <p class="min-w-fit">
          <span class="badge badge-primary badge-outline mr-1">
            {$t('notification.notified_at')}
          </span>
          {parseDateTime(notification.dateCreated)}
        </p>
        {#if notification.dateRead}
          <p class="min-w-fit">
            <span class="badge badge-primary badge-outline mr-1">{$t('notification.read_at')}</span>
            {parseDateTime(notification.dateRead)}
          </p>
        {/if}
      </div>
    </div>
  </div>
</div>
