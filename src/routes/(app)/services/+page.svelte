<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query';
  import { superForm } from 'sveltekit-superforms';

  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import Service from '$lib/components/Service.svelte';
  import Tag from '$lib/components/Tag.svelte';
  import { TAG_JOINER } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  export let data;

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  $: ({ searchParams, page, user, api } = data);

  let targetType = 0;
  let tagsRaw = '';
  let tags: string[] = [];
  let showTags = true;
  let newTag = '';

  $: query = createQuery(api.service.list(searchParams));

  $: resourcePath = searchParams?.resourcePath as string | undefined;
  $: resourceId = searchParams?.resourceId as string | undefined;
</script>

<svelte:head>
  <title>
    {$t('common.services')} | {$t('common.site_name')}
  </title>
</svelte:head>

<input
  type="checkbox"
  id="service-add"
  class="modal-toggle"
  checked={$submitting || $allErrors.length > 0}
/>
<div class="modal" role="dialog">
  <div class="modal-box min-w-[60vw]">
    <label
      for="service-add"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('common.add')}</h3>
    <form method="POST" class="w-full form-control" use:enhance>
      <div
        class={$errors.name ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.name ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.name')}
          </span>
          <input
            type="text"
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="name"
            name="name"
            placeholder={$t('common.name')}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.name ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.targetType
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.targetType ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('service.target_type')}
          </span>
          <select
            id="target_type"
            name="targetType"
            class={`select transition border-2 normal-border join-item w-3/4 ${
              $errors.targetType ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            bind:value={targetType}
          >
            {#each [...Array(3).keys()] as i}
              <option value={i}>{$t(`service.target_types.${i}`)}</option>
            {/each}
          </select>
        </label>
      </div>
      <div
        class={$errors.code ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.code ? $errors.code : ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.code')}
          </span>
          <textarea
            id="code"
            name="code"
            class={`textarea transition border-2 normal-border join-item ${
              $errors.code ? 'hover:textarea-error' : 'hover:textarea-secondary'
            } w-3/4 h-28`}
            placeholder={$t('common.code')}
          ></textarea>
        </label>
      </div>
      <div
        class={$errors.resourceId
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.resourceId ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('service.resource_id')}{$t('common.optional')}
          </span>
          <input
            type="text"
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="resource_id"
            name="resourceId"
            placeholder={`${$t('service.resource_id')}${$t('common.optional')}`}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.resourceId ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.description
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.description ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.description')}{$t('common.optional')}
          </span>
          <textarea
            id="description"
            name="description"
            placeholder={`${$t('common.description')}${$t('common.optional')}`}
            class={`textarea transition border-2 normal-border join-item ${
              $errors.description ? 'hover:textarea-error' : 'hover:textarea-secondary'
            } w-3/4 h-28`}
          ></textarea>
        </label>
      </div>
      <input type="hidden" id="parameters" name="parameters" bind:value={tagsRaw} />
      <div
        class={$errors.parameters ? 'tooltip tooltip-open tooltip-right tooltip-error' : ''}
        data-tip={$errors.parameters ? $errors.parameters : ''}
      >
        <label class="join my-2 w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('service.parameters')}
          </span>
          <input
            type="text"
            on:keydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (!newTag || tags.includes(newTag)) return;
                showTags = false;
                tags.push(newTag);
                tagsRaw = tags.join(TAG_JOINER);
                newTag = '';
                setTimeout(() => {
                  showTags = true;
                }, 0);
              }
            }}
            id="new_tag"
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.parameters ? 'hover:input-error' : 'hover:input-secondary'
            }`}
            bind:value={newTag}
          />
          <button
            class="btn border-2 normal-border btn-outline btn-square hover:btn-secondary join-item"
            aria-label={$t('common.add')}
            on:click|preventDefault={() => {
              if (!newTag || tags.includes(newTag)) return;
              showTags = false;
              tags.push(newTag);
              tagsRaw = tags.join(TAG_JOINER);
              newTag = '';
              setTimeout(() => {
                showTags = true;
              }, 0);
            }}
            on:keyup
          >
            <i class="fa-solid fa-plus"></i>
          </button>
        </label>
      </div>
      {#if showTags}
        <div class="flex gap-1 flex-wrap">
          {#each tags as tag, i}
            <Tag
              {tag}
              removeFunction={() => {
                showTags = false;
                tags.splice(i, 1);
                tagsRaw = tags.join(TAG_JOINER);
                setTimeout(() => {
                  showTags = true;
                }, 0);
              }}
            />
          {/each}
        </div>
      {/if}
      <div class="modal-action">
        <div
          class="{$message ? 'tooltip tooltip-open tooltip-left tooltip-error' : ''} max-w-fit"
          data-tip={$message}
        >
          <button
            type="submit"
            class="btn {$allErrors.length > 0
              ? 'btn-error'
              : $submitting
                ? 'btn-ghost'
                : 'btn-outline border-2 normal-border'} w-full"
            disabled={$submitting}
          >
            {$allErrors.length > 0
              ? $t('common.error')
              : $submitting
                ? $t('common.waiting')
                : $t('common.submit')}
          </button>
        </div>
      </div>
    </form>
  </div>
</div>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <div class="flex gap-2 flex-wrap justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">{$t('common.services')}</h1>
      <SearchBar name="common.services" {searchParams} />
      {#if user && getUserPrivilege(user.role) === 6}
        <label for="service-add" class="btn border-2 normal-border hover:btn-outline join-item">
          {$t('common.add')}
        </label>
      {/if}
    </div>
    {#if total && perPage && data.length > 0}
      <div class="result">
        {#each data as service}
          <div class="min-w-fit">
            <Service {service} {resourcePath} {resourceId} />
          </div>
        {/each}
      </div>
      <Paginator {total} {perPage} {page} {searchParams} />
    {:else}
      <p class="py-3 text-center">{$t('common.empty')}</p>
    {/if}
  </div>
{:else if $query.isError}
  <Error error={$query.error} />
{:else}
  <div class="min-h-page skeleton"></div>
{/if}
