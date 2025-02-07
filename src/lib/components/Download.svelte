<script lang="ts">
  import { t } from '$lib/translations/config';

  interface Props {
    file: string;
    name: string;
    inline?: boolean;
    class: string;
  }
  let { file, name, inline = false, ...rest }: Props = $props();

  let progress: number | undefined = $state();

  const getBlob = async (response: Response) => {
    while (response.body === null);
    const reader = response.body.getReader();
    let contentLength = +(response.headers.get('Content-Length') ?? 0);
    let receivedLength = 0;
    let chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      receivedLength += value.length;
      contentLength = Math.max(contentLength, receivedLength);
      progress = receivedLength / contentLength;
    }
    let chunksAll = new Uint8Array(receivedLength);
    let position = 0;
    for (let chunk of chunks) {
      chunksAll.set(chunk, position);
      position += chunk.length;
    }
    return new Blob([chunksAll], { type: 'application/octet-stream' });
  };

  const download = async () => {
    progress = 0;
    const resp = await fetch(file);
    const blob = await getBlob(resp);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `${name}.${file.split('.').pop()}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    setTimeout(() => {
      progress = undefined;
    }, 3000);
  };
</script>

{#if progress === undefined}
  <button
    class="btn {inline ? 'btn-xs' : ''} btn-ghost border-2 hover:btn-outline {rest.class}"
    onclick={download}
  >
    {#if !inline}
      <i class="fa-solid fa-file-arrow-down fa-lg"></i>
    {/if}
    {$t('common.download')}
  </button>
{:else if progress < 1}
  <button class="btn {inline ? 'btn-xs' : ''} btn-ghost btn-disabled {rest.class}">
    {#if !inline}
      <span class="loading loading-dots loading-xs"></span>
    {/if}
    <span>{(progress * 100).toFixed(0)}%</span>
  </button>
{:else}
  <button class="btn {inline ? 'btn-xs' : ''} btn-success no-animation {rest.class}">
    {#if !inline}
      <i class="fa-solid fa-check fa-lg"></i>
    {/if}
    <span>{(progress * 100).toFixed(0)}%</span>
  </button>
{/if}
