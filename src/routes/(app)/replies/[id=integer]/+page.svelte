<script lang="ts">
  import { goto, preloadData } from '$app/navigation';
  import Comment from '$lib/components/comment.svelte';
  import Like from '$lib/components/like.svelte';
  import { t } from '$lib/translations/config';
  import { getCompressedImage, getUserLevel, parseDateTime } from '$lib/utils';

  export let data: import('./$types').PageData;
  $: ({ status, content, error, access_token, user } = data);
</script>

<svelte:head>
  <title>{$t('common.reply')} | {$t('common.title')}</title>
</svelte:head>

<div class="hero min-h-screen bg-base-200">
  <div class="w-5/6 form-control mx-auto">
    {#if content}
      <div class="indicator w-full my-4">
        <span
          class="indicator-item indicator-start badge badge-secondary badge-lg min-w-fit w-20 h-8 text-lg"
          >{$t('common.reply')}</span
        >
        <div class="card card-side w-full bg-base-100 border border-base-300 shadow-lg">
          <figure class="w-1/6 min-w-fit">
            <div
              class="relative inline-flex items-center form-control border-r border-base-300 px-3 py-3 mx-auto my-auto"
            >
              <div
                class={`w-[72px] rounded-full overflow-hidden border-[3px] border-opacity-80 ${
                  content.user.type == 'admin'
                    ? 'border-indigo-500'
                    : user.type == 'volunteer'
                    ? 'border-emerald-500'
                    : user.type == 'qualified'
                    ? 'border-sky-500'
                    : 'border-neutral-500'
                }`}
              >
                <a data-sveltekit-preload-data href={`/users/${content.user.id}`}>
                  <img
                    class="object-fill"
                    src={getCompressedImage(content.user.avatar)}
                    alt="Avatar"
                  />
                </a>
              </div>
              <a data-sveltekit-preload-data href={`/users/${content.user.id}`}>
                <p class="text-lg text-center max-w-[120px] break-all">
                  {content.user.username}
                </p>
              </a>
              <div class="flex gap-1 aspect-[21/5]">
                <span class="badge badge-sm font-bold">LV{getUserLevel(content.user.exp)}</span>
                {#if content.user.tag}
                  <span class="badge badge-sm badge-accent">{content.user.tag}</span>
                {/if}
              </div>
            </div>
          </figure>
          <div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
            <p class="w-full content text-lg">
              {content.content}
            </p>
            <div class="card-actions mt-4 flex justify-between items-center">
              <p class="text-sm opacity-70">
                {parseDateTime(content.creation)}
              </p>
              <div class="flex items-center gap-1">
                <Like
                  id={content.like}
                  likes={content.like_count}
                  type={'reply'}
                  target={content.id}
                  token={access_token}
                  {user}
                  css="sm"
                />
                {#if content?.comment}
                  <button
                    class="btn btn-sm btn-primary btn-outline"
                    on:click={() => {
                      goto(`/comments/${content?.comment}`);
                    }}
                    on:pointerenter={() => {
                      preloadData(`/comments/${content?.comment}`);
                    }}
                  >
                    <svg
                      fill="currentColor"
                      width="25px"
                      height="25px"
                      viewBox="-5.5 0 32 32"
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.52 23.72v0c-1.2 0-2.36-0.48-3.2-1.32-0.84-0.88-1.32-2-1.32-3.2s0.48-2.36 1.32-3.2l4.24-4.24c0.8-0.8 1.88-1.28 3.040-1.32 0.48 0 0.84 0.36 0.88 0.8 0 0.48-0.36 0.84-0.8 0.88-0.72 0.040-1.4 0.32-1.92 0.84l-4.24 4.2c-0.52 0.52-0.84 1.24-0.84 2s0.28 1.48 0.84 2c0.52 0.52 1.24 0.84 2 0.84s1.48-0.28 2-0.84l4.24-4.24c0.52-0.52 0.84-1.24 0.84-2 0-0.48 0.36-0.84 0.84-0.84s0.84 0.36 0.84 0.84c0 1.2-0.48 2.36-1.32 3.2l-4.24 4.24c-0.88 0.88-2 1.36-3.2 1.36zM12 21.56c-0.44 0-0.8-0.36-0.84-0.8 0-0.48 0.32-0.84 0.8-0.88 0.72-0.040 1.4-0.32 1.88-0.84l4.28-4.24c1.12-1.12 1.12-2.92 0-4-1.12-1.12-2.92-1.12-4 0l-4.28 4.24c-0.52 0.52-0.8 1.2-0.84 1.92 0 0.48-0.4 0.8-0.88 0.8s-0.84-0.4-0.8-0.88c0.040-1.16 0.52-2.24 1.32-3.040l4.28-4.24c1.76-1.76 4.64-1.76 6.4 0s1.76 4.64 0 6.4l-4.28 4.24c-0.8 0.8-1.84 1.28-3.040 1.32 0.040 0 0 0 0 0z"
                      />
                    </svg>
                    {$t('common.source')}
                  </button>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  * {
    font-family: 'Saira', 'Noto Sans SC', sans-serif;
  }
</style>
