<script lang="ts">
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import { superForm } from 'sveltekit-superforms';

  import type { CreateOpts } from '$lib/api/resourceRecord';

  import Error from '$lib/components/Error.svelte';
  import Paginator from '$lib/components/Paginatior.svelte';
  import ResourceRecord from '$lib/components/ResourceRecord.svelte';
  import SearchBar from '$lib/components/SearchBar.svelte';
  import { Status } from '$lib/constants';
  import { t } from '$lib/translations/config';
  import { getUserPrivilege } from '$lib/utils';

  let { data } = $props();
  let { searchParams, page, user, api } = $derived(data);

  const { enhance, message, errors, submitting, allErrors } = superForm(data.form);

  let type = $state(0);
  let editionType = $state(0);
  let edition = $state('');
  let strategy = $state(0);
  let batchModalOpen = $state(false);
  let batchStatus = $state(Status.OK);
  let batchError = $state('');
  let batchTotal = $state(0);
  let batch: CreateOpts[] | null = $state(null);

  let options = $derived(api.resourceRecord.list(searchParams));
  let query = $derived(createQuery({ ...options }));

  const queryClient = useQueryClient();

  const parseNullable = (str: string): string | undefined => {
    return !str || str === 'null' ? undefined : str;
  };

  const parseCsvLine = (line: string): string[] => {
    const fields = [];
    let currentField = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === ',' && !insideQuotes) {
        fields.push(currentField.trim());
        currentField = '';
      } else if (char === '"') {
        if (line[i + 1] === '"') {
          currentField += '"';
          i++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else {
        currentField += char;
      }
    }

    fields.push(currentField.trim());
    return fields;
  };

  const convertCsvToJson = async (file: File): Promise<CreateOpts[]> => {
    return new Promise<CreateOpts[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const csvData = event.target?.result as string;
        const lines = csvData.split(/\r?\n/).filter((line) => line.includes(','));
        batchTotal = lines.length - 1;
        const lineLength = lines[0].split(',').length;
        const results: CreateOpts[] = [];

        for (let i = 1; i < lines.length; i++) {
          const fields = parseCsvLine(lines[i]);

          if (fields.length === lineLength) {
            const data: CreateOpts = {
              title: fields[0],
              type: parseInt(fields[1]),
              editionType: parseInt(fields[2]),
              edition: parseNullable(fields[3]),
              strategy: parseInt(fields[4]),
              authorName: fields[5],
              copyrightOwner: fields[6],
              source: fields[7],
              description: parseNullable(fields[8]),
            };
            results.push(data);
          }
        }
        resolve(results);
      };

      reader.onerror = (event: ProgressEvent<FileReader>) => {
        reject(event.target?.error);
      };

      reader.readAsText(file);
    });
  };

  const resolveBatch = async (e: Event & { currentTarget: EventTarget & HTMLInputElement }) => {
    const target = e.currentTarget;
    if (target.files && target.files.length > 0) {
      batch = await convertCsvToJson(target.files[0]);
    }
  };

  const uploadBatch = async () => {
    if (batch) {
      batchStatus = Status.SENDING;
      batchError = '';
      const resp = await api.resourceRecord.createBatch(batch);
      if (resp.ok) {
        batchStatus = Status.OK;
        batchModalOpen = false;
        batch = null;
        await queryClient.invalidateQueries({ queryKey: options.queryKey });
      } else {
        batchStatus = Status.ERROR;
        batchError = (await resp.json()).code;
      }
    }
  };
</script>

<svelte:head>
  <title>{$t('common.resource_records')} | {$t('common.site_name')}</title>
</svelte:head>

<input
  type="checkbox"
  id="resource-record-add"
  class="modal-toggle"
  checked={$submitting || $allErrors.length > 0}
/>
<div class="modal" role="dialog">
  <div class="modal-box min-w-[48vw]">
    <label
      for="resource-record-add"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('common.add')}</h3>
    <form method="POST" class="w-full form-control" use:enhance>
      <div
        class={$errors.title ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.title ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('resource_record.title')}
          </span>
          <input
            type="text"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="title"
            name="title"
            placeholder={$t('resource_record.title')}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.title ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.type ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.type ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.type')}
          </span>
          <select
            id="type"
            name="type"
            class={`select transition border-2 normal-border join-item w-3/4 ${
              $errors.type ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            bind:value={type}
          >
            {#each [...Array(2).keys()] as i}
              <option value={i}>{$t(`resource_record.types.${i}`)}</option>
            {/each}
          </select>
        </label>
      </div>
      <div
        class={$errors.editionType || $errors.edition
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.editionType ?? $errors.edition ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('resource_record.edition')}
          </span>
          <select
            id="edition_type"
            name="editionType"
            class={`select transition border-2 normal-border join-item ${
              editionType === 0 ? 'w-3/4' : 'w-1/4'
            } ${$errors.type ? 'hover:select-error' : 'hover:select-secondary'}`}
            bind:value={editionType}
          >
            {#each [...Array(3).keys()] as i}
              <option value={i}>{$t(`resource_record.edition_types.${i}`)}</option>
            {/each}
          </select>
          {#if editionType !== 0}
            <input
              type="text"
              onkeydown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                }
              }}
              id="edition"
              name="edition"
              placeholder={$t('resource_record.edition_placeholder')}
              class={`input transition border-2 normal-border join-item w-1/2 min-w-[180px] ${
                $errors.edition ? 'hover:input-error' : 'hover:input-secondary'
              }`}
              bind:value={edition}
            />
          {/if}
        </label>
      </div>
      {#if edition}
        <div class="flex my-2">
          <span class="w-1/4 place-self-center">
            {$t('common.form.edition_preview')}
          </span>
          <div class="w-3/4">
            <button type="button" class="btn btn-xs btn-shallow text-sm font-normal no-animation">
              {$t(`resource_record.edition_types.${editionType}`)}
            </button>
            {#if edition}
              {edition}
            {/if}
          </div>
        </div>
      {/if}
      <div
        class={$errors.strategy ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.strategy ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('resource_record.strategy')}
          </span>
          <select
            id="strategy"
            name="strategy"
            class={`select transition border-2 normal-border join-item w-3/4 ${
              $errors.strategy ? 'hover:select-error' : 'hover:select-secondary'
            }`}
            bind:value={strategy}
          >
            {#each [...Array(5).keys()] as i}
              <option value={i}>{$t(`resource_record.strategies.${i}`)}</option>
            {/each}
          </select>
        </label>
      </div>
      <div
        class={$errors.authorName
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.authorName ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('resource_record.author')}
          </span>
          <input
            type="text"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="author_name"
            name="authorName"
            placeholder={$t('resource_record.author')}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.authorName ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.copyrightOwner
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.copyrightOwner ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('resource_record.copyright_owner')}
          </span>
          <input
            type="text"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="copyright_owner"
            name="copyrightOwner"
            placeholder={$t('resource_record.copyright_owner')}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.copyrightOwner ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.source ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2' : 'my-2'}
        data-tip={$errors.source ?? ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.source')}
          </span>
          <input
            type="text"
            onkeydown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
            id="source"
            name="source"
            placeholder={$t('common.source')}
            class={`input transition border-2 normal-border join-item w-3/4 min-w-[180px] ${
              $errors.source ? 'hover:input-error' : 'hover:input-secondary'
            }`}
          />
        </label>
      </div>
      <div
        class={$errors.description
          ? 'tooltip tooltip-open tooltip-bottom tooltip-error my-2'
          : 'my-2'}
        data-tip={$errors.description ? $errors.description : ''}
      >
        <label class="join w-full">
          <span class="btn no-animation join-item w-1/4 min-w-[64px]">
            {$t('common.description')}{$t('common.optional')}
          </span>
          <textarea
            id="description"
            name="description"
            class={`textarea transition border-2 normal-border join-item ${
              $errors.description ? 'hover:textarea-error' : 'hover:textarea-secondary'
            } w-3/4 h-28`}
            placeholder={`${$t('common.description')}${$t('common.optional')}`}
          ></textarea>
        </label>
      </div>
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

<input
  type="checkbox"
  id="resource-record-add-batch"
  class="modal-toggle"
  bind:checked={batchModalOpen}
/>
<div class="modal" role="dialog">
  <div class="modal-box {batch === null ? 'min-w-[40vw]' : 'min-w-[75vw]'}">
    <label
      for="resource-record-add-batch"
      class="btn btn-sm btn-circle btn-ghost border-2 hover:btn-outline absolute right-2 top-2"
    >
      ✕
    </label>
    <h3 class="font-bold text-lg mb-2">{$t('common.add_in_bulk')}</h3>
    <div class="flex items-center">
      <span class="w-32">{$t('resource_record.csv_file')}</span>
      <input
        type="file"
        id="file"
        name="File"
        accept=".csv"
        class={`w-full file:mr-4 file:py-2 file:border-0 file:btn ${
          batchStatus === Status.ERROR
            ? 'input-error file:btn-error'
            : 'input-secondary file:btn-outline file:bg-secondary'
        }`}
        oninput={resolveBatch}
      />
    </div>
    {#if batch !== null}
      <div class="flex justify-between mt-4 mb-2 items-center">
        <h4 class="font-bold text-base">
          {$t('resource_record.csv_complete', {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            valid: batch.length,
            total: batchTotal,
          })}
        </h4>
        <button
          type="button"
          class="btn btn-sm {batch ? 'border-2 hover:btn-outline' : 'btn-disabled'}"
          onclick={() => {
            batch = null;
            batchStatus = Status.OK;
            batchError = '';
          }}
        >
          {$t('common.empty_v')}
        </button>
      </div>
      <div class="result my-2">
        {#each batch as resourceRecord}
          <div class="min-w-fit">
            <div
              class="card w-80 bg-base-100 overflow-hidden transition border-2 normal-border hover:border-primary hover:shadow-lg"
            >
              <div class="card-body py-6 gap-0.5">
                {#if resourceRecord.strategy === 0}
                  <div
                    class="tooltip tooltip-left tooltip-success absolute top-6 right-6"
                    data-tip={$t('resource_record.strategies.0')}
                  >
                    <div class="btn btn-xs btn-circle btn-success no-animation">
                      <i class="fa-solid fa-check"></i>
                    </div>
                  </div>
                {:else if resourceRecord.strategy === 4}
                  <div
                    class="tooltip tooltip-left tooltip-error absolute top-6 right-6"
                    data-tip={$t('resource_record.strategies.4')}
                  >
                    <div class="btn btn-xs btn-circle btn-error no-animation">
                      <i class="fa-solid fa-xmark"></i>
                    </div>
                  </div>
                {:else}
                  <div
                    class="tooltip tooltip-left tooltip-warning absolute top-6 right-6"
                    data-tip={$t(`resource_record.strategies.${resourceRecord.strategy}`)}
                  >
                    <div class="btn btn-xs btn-circle btn-warning no-animation">
                      <i class="fa-solid fa-exclamation"></i>
                    </div>
                  </div>
                {/if}
                <div class="tooltip tooltip-bottom max-w-fit" data-tip={resourceRecord.title}>
                  <h2 class="title mb-1 truncate w-fit max-w-[220px]">
                    {resourceRecord.title}
                  </h2>
                </div>
                <div
                  class="tooltip tooltip-bottom max-w-fit"
                  data-tip={$t(`resource_record.types.${resourceRecord.type}`)}
                >
                  <p class="truncate">
                    <span class="badge mr-1">{$t('common.type')}</span>
                    {$t(`resource_record.types.${resourceRecord.type}`)}
                  </p>
                </div>
                <div
                  class="tooltip tooltip-bottom max-w-fit"
                  data-tip={`${$t(`resource_record.edition_types.${resourceRecord.editionType}`)}${
                    resourceRecord.edition ? `${$t('common.colon')}${resourceRecord.edition}` : ''
                  }`}
                >
                  <p class="truncate">
                    <span class="badge mr-1">{$t('resource_record.edition')}</span>
                    {resourceRecord.edition ??
                      $t(`resource_record.edition_types.${resourceRecord.editionType}`)}
                  </p>
                </div>
                <div
                  class="tooltip tooltip-bottom max-w-fit"
                  data-tip={$t(`resource_record.strategies.${resourceRecord.strategy}`)}
                >
                  <p class="truncate">
                    <span class="badge mr-1">{$t('resource_record.strategy')}</span>
                    {$t(`resource_record.strategies.${resourceRecord.strategy}`)}
                  </p>
                </div>
                <div class="tooltip tooltip-bottom max-w-fit" data-tip={resourceRecord.authorName}>
                  <p class="truncate">
                    <span class="badge mr-1">{$t('resource_record.author')}</span>
                    {resourceRecord.authorName}
                  </p>
                </div>
                <div
                  class="tooltip tooltip-bottom max-w-fit"
                  data-tip={resourceRecord.copyrightOwner}
                >
                  <p class="truncate">
                    <span class="badge mr-1">{$t('resource_record.copyright_owner')}</span>
                    {resourceRecord.copyrightOwner}
                  </p>
                </div>
                <div class="tooltip tooltip-bottom max-w-fit" data-tip={resourceRecord.source}>
                  <p class="truncate">
                    <span class="badge mr-1">{$t('common.source')}</span>
                    <a
                      href={resourceRecord.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="hover:underline"
                    >
                      {resourceRecord.source}
                    </a>
                  </p>
                </div>
                <div
                  class="tooltip tooltip-top max-w-fit"
                  data-tip={resourceRecord.description ?? $t('common.empty_adj')}
                >
                  <p class="truncate">
                    <span class="badge mr-1">{$t('common.description')}</span>
                    {resourceRecord.description ?? $t('common.empty_adj')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
    <div class="modal-action">
      <div
        class={batchStatus === Status.ERROR
          ? 'tooltip tooltip-open tooltip-left tooltip-error'
          : ''}
        data-tip={$t(`error.${batchError}`)}
      >
        <button
          class="btn {batchStatus === Status.ERROR
            ? 'btn-error'
            : batchStatus === Status.SENDING
              ? 'btn-ghost'
              : 'btn-outline border-2 normal-border'} w-full"
          disabled={batchStatus === Status.SENDING}
          onclick={uploadBatch}
        >
          {batchStatus === Status.ERROR
            ? $t('common.error')
            : batchStatus === Status.SENDING
              ? $t('common.waiting')
              : $t('common.submit')}
        </button>
      </div>
    </div>
  </div>
</div>

{#if $query.isSuccess}
  {@const { total, perPage, data } = $query.data}
  <div class="page">
    <div class="flex gap-2 flex-wrap justify-between items-center mb-6">
      <h1 class="text-4xl font-bold">{$t('common.resource_records')}</h1>
      <SearchBar name="common.resource_records" {searchParams} />
      {#if getUserPrivilege(user?.role) > 4}
        <div class="join">
          <label
            for="resource-record-add"
            class="btn border-2 normal-border hover:btn-outline join-item"
          >
            {$t('common.add')}
          </label>
          <label
            for="resource-record-add-batch"
            class="btn border-2 normal-border hover:btn-outline join-item"
          >
            {$t('common.add_in_bulk')}
          </label>
        </div>
      {/if}
    </div>
    {#if total && perPage && data.length > 0}
      <div class="result">
        {#each data as resourceRecord}
          <div class="min-w-fit">
            <ResourceRecord {resourceRecord} />
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
