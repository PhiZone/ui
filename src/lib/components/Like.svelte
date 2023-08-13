<script lang="ts">
  import { page } from '$app/stores';

  $: ({ api } = $page.data);

  interface $$Props {
    id: string;
    likes: number;
    type: 'comments' | 'replies' | 'charts' | 'songs' | 'chapters';
    class: string;
  }

  export let id: string;
  export let likes: number;
  export let type: 'comments' | 'replies' | 'charts' | 'songs' | 'chapters';

  const like = async () => {
    const resp = await api.like.create({
      type,
      id,
    });
    if (resp.ok) {
      likes++;
    } else {
      const data = await resp.json();
      // TODO: toast
      console.error(data);
    }
  };

  const unlike = async () => {
    const resp = await api.like.remove({ type, id });
    if (resp.ok) {
      likes--;
    } else {
      const data = await resp.json();
      // TODO: toast
      console.error(data);
    }
  };
</script>

{#if !id}
  <button class="btn btn-primary btn-outline gap-2 {$$restProps.class}" on:click={like}>
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
