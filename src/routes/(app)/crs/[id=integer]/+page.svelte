<script lang="ts">
  import { enhance } from '$app/forms';
  import VolunteerVoteHelper from '$lib/components/VolunteerVoteHelper.svelte';
  import { parseDateTime } from '$lib/utils.js';

  export let data;
  $: ({ data: votes, official, user } = data);

  let score = 0;
  let message = '';
  let disabled = false;
</script>

{#if data.data !== null}
  <VolunteerVoteHelper bind:score bind:message />
  <div class="page md:px-24">
    <div class="flex justify-between">
      <h1 class="text-4xl font-bold mb-6">{official ? '官方谱组' : '自制谱组'}投票</h1>
      <a href="/crs" class="btn btn-secondary btn-outline">返回</a>
    </div>
    <div class="flex flex-col md:flex-row gap-5">
      <div class="flex md:w-1/3">
        <form
          action="?/vote"
          method="post"
          class="flex flex-col gap-4 w-full"
          use:enhance={() => {
            return async ({ result }) => {
              if (result.type === 'failure') {
                console.log(result.data);
              } else if (result.type === 'success') {
                alert('投票成功');
                window.location.reload();
              }
            };
          }}
        >
          <input
            id="name"
            name="name"
            type="text"
            class="hidden"
            value={user ? user.userName : '匿名用户'}
          />
          <input
            id="user"
            name="user"
            type="text"
            class="hidden"
            value={user ? user.id : undefined}
          />
          <div class="flex gap-2">
            <div class="w-full">
              <input
                type="range"
                id="score"
                name="score"
                min="-3"
                max="3"
                bind:value={score}
                class="range"
                step="1"
              />
              <div class="w-full flex justify-between text-xs px-2">
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
                <span>|</span>
              </div>
            </div>
            <p class="text-lg font-bold text-right w-[19px]">{score}</p>
          </div>
          <textarea
            id="message"
            name="message"
            class="mr-3 textarea textarea-secondary w-full h-64"
            placeholder="对谱面进行评价"
            {disabled}
            bind:value={message}
          />
          <div class="join join-vertical">
            <label for="vote_helper" class="btn btn-outline btn-primary join-item">评分助手</label>
            <button
              class="w-full btn btn-outline btn-primary join-item"
              disabled={disabled || message.length === 0}
            >
              提交投票
            </button>
          </div>
        </form>
      </div>
      <ul class="menu p-0 gap-2 md:w-2/3">
        {#if votes && votes.length > 0}
          {#each votes as vote}
            <div class="card card-side w-full bg-base-100 border border-base-300 shadow-lg">
              <figure class="w-1/6 min-w-fit">
                <div
                  class="relative inline-flex items-center justify-center form-control border-r border-base-300 px-3 py-3 mx-auto my-auto"
                >
                  <p class="opacity-80">分数</p>
                  <p class="text-4xl font-extrabold">
                    {vote.score}
                  </p>
                </div>
              </figure>
              <div class="card-body w-5/6 pt-6 pl-6 pb-4 pr-4">
                <p class="w-full content text-lg">
                  {vote.message}
                </p>
                <div class="w-full mt-4 flex justify-between items-center">
                  <p class="text-sm opacity-70">{vote.official ? '官方谱组' : '自制谱组'}</p>
                  <p class="text-sm opacity-70 text-right">
                    {vote.name}
                    @
                    {parseDateTime(vote.date)}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        {:else}
          <p class="py-3 text-center">暂无投票</p>
        {/if}
      </ul>
    </div>
  </div>
{:else}
  <div class="page" />
{/if}
