<script lang="ts">
  import type { ServiceScriptDto } from '$lib/api/service';
  import { t } from '$lib/translations/config';
  import ServiceRequest from './ServiceRequest.svelte';

  export let service: ServiceScriptDto;
  export let resourcePath: string | undefined = undefined;
  export let resourceId: string | undefined = undefined;

  if (service.targetType === 2) {
    resourcePath = undefined;
    resourceId = undefined;
  }
</script>

<a
  href={`/services/${service.id}${
    resourcePath && resourceId ? `?resourcePath=${resourcePath}&resourceId=${resourceId}` : ''
  }`}
  class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
>
  <div class="card-body h-[185.25px] py-6 gap-0.5 justify-between">
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
        <span class="description">
          <span class="inline-flex badge mr-1">{$t('common.description')}</span>
          {service.description}
        </span>
      </p>
    {/if}
    <div class="card-actions justify-end">
      <ServiceRequest {service} {resourcePath} {resourceId} />
    </div>
  </div>
</a>
