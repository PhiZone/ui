<script lang="ts">
  import { page } from '$app/stores';
  import type { EventTaskDto } from '$lib/api/event';
  import { t } from '$lib/translations/config';
  import { parseDateTime } from '$lib/utils';

  $: ({ user } = $page.data);

  export let task: EventTaskDto;
</script>

<a
  href={`/events/divisions/${task.divisionId}/tasks/${task.id}`}
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <div class="card-body h-[185.25px] py-6 gap-0.5">
    <div class="flex flex-col mb-2">
      <h2 class="title-strong w-full truncate">
        {task.name}
      </h2>
      <h2 class="subtitle opacity-80 w-full truncate">
        {$t(`event.task.types.${task.type}`)}
      </h2>
    </div>
    {#if task.type === 0 && task.dateExecuted}
      <p class="truncate">
        <span class="badge mr-1">{$t('event.task.date_executed')}</span>
        {parseDateTime(task.dateExecuted, true, user?.language)}
      </p>
    {/if}
    {#if task.description}
      <p class="flex items-center">
        <span class="content description">
          <span class="inline-flex badge mr-1">{$t('common.description')}</span>
          {task.description}
        </span>
      </p>
    {/if}
  </div>
</a>
