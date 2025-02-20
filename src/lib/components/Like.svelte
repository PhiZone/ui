<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let { api } = $derived(page.data);

  interface Props {
    type:
      | 'comments'
      | 'replies'
      | 'records'
      | 'charts'
      | 'songs'
      | 'chapters'
      | 'applications'
      | 'collections'
      | 'events'
      | 'events/divisions';
    id: string;
    likes: number;
    liked: boolean;
    class: string;
  }
  let { type, id, likes = $bindable(), liked = $bindable(), ...rest }: Props = $props();

  const like = async (e: MouseEvent) => {
    e.preventDefault();
    liked = true;
    likes++;
    const resp = await api.like.like({
      type,
      id,
    });
    if (!resp.ok) {
      liked = false;
      likes--;
      if (resp.status === 401) {
        goto(`/session/login?redirect=${page.url.pathname + page.url.search}`);
      } else {
        const data = await resp.json();
        console.error(
          `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
          data,
        );
      }
    }
  };

  const unlike = async (e: MouseEvent) => {
    e.preventDefault();
    liked = false;
    likes--;
    const resp = await api.like.unlike({ type, id });
    if (!resp.ok) {
      liked = true;
      likes++;
      const data = await resp.json();
      // TODO: toast
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        data,
      );
    }
  };
</script>

{#if !liked}
  <button
    class="btn btn-ghost border-2 hover:btn-outline overflow-hidden flex justify-center gap-2 {rest.class}"
    onclick={like}
  >
    <i class="fa-regular fa-heart fa-lg"></i>
    <p class="text-left max-w-fit">{likes}</p>
  </button>
{:else}
  <button
    class="btn btn-ghost border-2 hover:btn-outline overflow-hidden flex justify-center gap-2 {rest.class}"
    onclick={unlike}
  >
    <i class="fa-solid fa-heart fa-lg"></i>
    <p class="text-left max-w-fit">{likes}</p>
  </button>
{/if}
