<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  $: ({ api } = $page.data);

  interface $$Props {
    type: 'comments' | 'replies' | 'charts' | 'songs' | 'chapters';
    id: string;
    likes: number;
    liked: boolean;
    class: string;
  }

  export let type: 'comments' | 'replies' | 'charts' | 'songs' | 'chapters';
  export let id: string;
  export let likes: number;
  export let liked: boolean;

  const like = async () => {
    liked = true;
    likes++;
    const resp = await api.like.create({
      type,
      id,
    });
    if (!resp.ok) {
      liked = false;
      likes--;
      if (resp.status == 401) {
        goto(`/session/login?redirect=${window.location.href}`);
      } else {
        const data = await resp.json();
        console.error(data);
      }
    }
  };

  const unlike = async () => {
    liked = false;
    likes--;
    const resp = await api.like.remove({ type, id });
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
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
    {likes}
  </button>
{:else}
  <button class="btn btn-primary btn-active gap-2 {$$restProps.class}" on:click={unlike}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5"
      fill="currentColor"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
    {likes}
  </button>
{/if}
