<script lang="ts">
  import queryString, { type ParsedQuery } from 'query-string';
  import { t } from '$lib/translations/config';
  import { goto } from '$app/navigation';

  export let name: string;
  export let pageName = 'page';
  export let searchParams: ParsedQuery<string | number | boolean>;

  let text = '';

  const getSearch = (text: string) => {
    return queryString.stringify({ ...searchParams, [pageName]: 1, search: text });
  };
</script>

<form
  class="form-control"
  on:submit|preventDefault={() => {
    goto(`?${getSearch(text)}`);
  }}
>
  <div class="join text-sm lg:text-md">
    <input
      type="text"
      placeholder={$t('common.search_placeholder', {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        resource: $t(name),
      })}
      class="input border-2 normal-border transition hover:input-secondary join-item w-full"
      bind:value={text}
    />
    <button
      class="btn btn-square border-2 normal-border bg-base-100 hover:bg-secondary hover:btn-secondary join-item"
    >
      <i class="fa-solid fa-magnifying-glass fa-lg"></i>
    </button>
  </div>
</form>
