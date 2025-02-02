<script lang="ts">
  import type { ServiceResponseDto, ServiceScriptDto } from '$lib/api/service';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';

  const { api } = $page.data;

  export let service: ServiceScriptDto;
  export let resourcePath: string | undefined = undefined;
  export let resourceId: string | undefined = undefined;

  interface $$Props {
    service: ServiceScriptDto;
    resourcePath?: string;
    resourceId?: string;
    class?: string;
  }

  let status = Status.WAITING;
  let response: ServiceResponseDto | undefined;

  let parameters = service.parameters.map(() => '');
  let useOnResource = resourcePath && resourceId;
  let idIndex = service.parameters.findIndex((p) => p.toLowerCase() === 'id');
  let showParams = service.parameters.length > 0;
  let paramsOpen = false;
  if (useOnResource && idIndex !== -1) {
    parameters[idIndex] = resourceId ?? '';
    if (service.parameters.length === 1) {
      showParams = false;
    }
  }

  const submit = async () => {
    paramsOpen = false;
    response = undefined;
    status = Status.SENDING;
    const opts = {
      id: service.id,
      parameters: Object.fromEntries(service.parameters.map((key, i) => [key, parameters[i]])),
    };
    const resp = await (useOnResource
      ? api.service.useOnResource(resourcePath ?? '', resourceId ?? '', opts)
      : api.service.use(opts));
    if (resp.ok) {
      status = Status.OK;
      const data = await resp.json();
      response = data.data;
      if (response.type === 2 && response.redirectUri) {
        if (response.redirectUri.startsWith('/')) {
          goto(response.redirectUri);
        } else {
          window.open(response.redirectUri, '_blank');
        }
      }
    } else {
      status = Status.ERROR;
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
  };
</script>

<input
  type="checkbox"
  id="service-result-{service.id}"
  class="modal-toggle"
  checked={[Status.SENDING, Status.OK, Status.ERROR].includes(status)}
/>
<div class="modal cursor-auto">
  <div class="modal-box min-w-fit m-4">
    <div class="flex gap-2 items-center">
      <h3 class="font-bold text-lg">
        {$t('service.result')}
      </h3>
      {#if response}
        {#if response.type === 0}
          <div class="btn btn-xs btn-circle btn-info no-animation">
            <i class="fa-solid fa-info"></i>
          </div>
        {:else if response.type === 1}
          <div class="btn btn-xs btn-circle btn-success no-animation">
            <i class="fa-solid fa-check"></i>
          </div>
        {:else if response.type === 2}
          <div class="btn btn-xs btn-circle btn-success no-animation">
            <i class="fa-solid fa-share"></i>
          </div>
        {:else}
          <div class="btn btn-xs btn-circle btn-error no-animation">
            <i class="fa-solid fa-xmark"></i>
          </div>
        {/if}
      {:else}
        <div class="btn btn-xs btn-circle btn-warning no-animation">
          <span class="loading loading-dots loading-xs"></span>
        </div>
      {/if}
    </div>
    <div class="py-4 flex flex-col gap-4 min-w-fit">
      <p>{$t(status === Status.SENDING ? 'service.waiting' : 'service.finished')}</p>
      <div class="self-center flex flex-col gap-2 items-center w-full">
        {#if status !== Status.SENDING}
          {#if response && response.message}
            <p class="text-lg whitespace-pre-wrap">{response.message}</p>
          {/if}
          {#if response && response.redirectUri}
            <a
              href={response.redirectUri}
              target={response.redirectUri.startsWith('/') ? '_self' : '_blank'}
              class="text-lg hover:underline"
            >
              {response.redirectUri}
            </a>
          {/if}
        {:else}
          <span class="loading loading-dots loading-lg"></span>
        {/if}
      </div>
    </div>
    <div class="modal-action">
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <btn
        class="btn {status !== Status.SENDING
          ? 'btn-success border-2 btn-outline'
          : 'btn-ghost btn-disabled'} on:keyup"
        on:click={() => {
          status = Status.WAITING;
        }}
        on:keyup
      >
        {$t('common.confirm')}
      </btn>
    </div>
  </div>
</div>

<input type="checkbox" id="service-{service.id}" class="modal-toggle" bind:checked={paramsOpen} />
<div class="modal cursor-auto">
  <div class="modal-box text-left">
    <button
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
      on:click={() => {
        paramsOpen = false;
      }}
    >
      ✕
    </button>
    <h3 class="font-bold text-lg">{$t('service.parameters')}</h3>
    <div class="py-4">
      {#each service.parameters as parameter, i}
        {#if !useOnResource || i !== idIndex}
          <label class="join my-2 w-full">
            <span class="btn no-animation join-item w-1/4 min-w-[64px]">
              {parameter}
            </span>
            <input
              type="text"
              on:keydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              class={'input transition border-2 normal-border hover:border-secondary join-item w-3/4'}
              bind:value={parameters[i]}
            />
          </label>
        {/if}
      {/each}
    </div>
    <div class="modal-action">
      <button class="btn border-2 normal-border btn-outline" on:click={submit}>
        {$t('common.submit')}
      </button>
    </div>
  </div>
</div>

<button
  class="btn btn-ghost {status === Status.SENDING
    ? 'btn-disabled'
    : 'btn-outline border-2 normal-border'} {$$restProps.class}"
  on:click|preventDefault={showParams
    ? () => {
        paramsOpen = true;
      }
    : submit}
>
  {#if status != Status.SENDING}
    <span>{$t('service.use')}</span>
  {:else}
    <span class="loading loading-dots"></span>
  {/if}
</button>
