<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: ({ api } = $page.data);

  interface $$Props {
    type: 'comments' | 'replies' | 'records' | 'charts' | 'songs' | 'chapters';
    id: string;
    likes: number;
    liked: boolean;
    class: string;
  }

  export let type: 'comments' | 'replies' | 'records' | 'charts' | 'songs' | 'chapters';
  export let id: string;
  export let likes: number;
  export let liked: boolean;

  const like = async () => {
    liked = true;
    likes++;
    const resp = await api.like.like({
      type,
      id,
    });
    if (!resp.ok) {
      liked = false;
      likes--;
      if (resp.status == 401) {
        goto(`/session/login?redirect=${$page.url.pathname}`);
      } else {
        const data = await resp.json();
        console.error(data);
      }
    }
  };

  const unlike = async () => {
    liked = false;
    likes--;
    const resp = await api.like.unlike({ type, id });
    if (!resp.ok) {
      liked = true;
      likes++;
      const data = await resp.json();
      // TODO: toast
      console.error(data);
    }
  };
</script>

{#if !liked}
  <button
    class="btn btn-primary btn-outline gap-2 overflow-hidden {$$restProps.class}"
    on:click={like}
  >
    <i class="fa-regular fa-heart fa-lg"></i>
    {likes}
  </button>
{:else}
  <button class="btn btn-primary btn-active gap-2 {$$restProps.class}" on:click={unlike}>
    <i class="fa-solid fa-heart fa-lg"></i>
    {likes}
  </button>
{/if}
