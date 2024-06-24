<script lang="ts">
  import type { ServiceScriptDto } from '$lib/api/service';
  import { t } from '$lib/translations/config';

  export let service: ServiceScriptDto;
</script>

<a
  href={`/services/${service.id}`}
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <div class="card-body h-[185.25px] py-6 gap-0.5">
    <div class="flex flex-col mb-2">
      <h2 class="title-strong w-full truncate">
        {service.name}
      </h2>
      <h2 class="subtitle opacity-80 w-full truncate">
        {$t(`service.target_types.${service.targetType}`)}
      </h2>
    </div>
    {#if service.description}
      <p class="flex items-center">
        <span class="content description">
          <span class="inline-flex badge mr-1">{$t('common.description')}</span>
          {service.description}
        </span>
      </p>
    {/if}
  </div>
</a>
