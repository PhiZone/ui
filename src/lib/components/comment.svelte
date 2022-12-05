<script lang="ts">
    import type { Comment, Reply } from '../models';
    import { t, locale } from '$lib/translations/config';
    import * as api from '$lib/api';

    export let comment: Comment;
    export let token: string;
    let showReplies = false,
        likeID = comment.like,
        likes = comment.likes,
        reply = '',
        replies: Reply[],
        previousReplies: string | null = null,
        nextReplies: string | null = null,
        page = 1;

    const like = async () => {
        likes++;
        likeID = -1;
        const resp = await api.POST(
            'likes/',
            {
                comment: comment.id,
            },
            token
        );
        const json = await resp.json();
        likeID = json.id;
    };

    const unlike = () => {
        likes--;
        const path = `likes/${likeID}/`;
        likeID = null;
        api.DELETE(path, token);
    };

    const getReplies = async (page?: number) => {
        const resp = await api.GET(
            `replies/?comment=${comment.id}${page ? `&page=${page}` : ''}`,
            token
        );
        const json = await resp.json();
        replies = json.results;
        previousReplies = json.previous;
        nextReplies = json.next;
        console.log(json);
    };

    const sendReply = async () => {
        if (reply && reply.length > 0) {
            await api.POST(
                `replies/`,
                { comment: comment.id, content: reply, language: locale.get() },
                token
            );
            reply = '';
            getReplies(page);
        }
    };
</script>

<div class="card card-side w-full bg-base-100 border border-base-300 shadow-xl">
    <figure>
        <div class="avatar items-center min-w-fit flex-col border-r border-base-300 px-6 py-3">
            <div class="w-16 rounded-full">
                <img src={comment.user.avatar} alt="Avatar" />
            </div>
            <p class="text-lg">{comment.user.username}</p>
        </div>
    </figure>
    <div class="card-body">
        <p>{comment.content}</p>
        <div class="card-actions flex items-center justify-end">
            {#if !likeID}
                <button class="btn btn-sm btn-secondary btn-outline gap-2" on:click={like}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        /></svg
                    >
                    {likes}
                </button>
            {:else}
                <button class="btn btn-sm btn-secondary btn-active gap-2" on:click={unlike}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        ><path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        /></svg
                    >
                    {likes}
                </button>
            {/if}
            <button
                class={`btn btn-sm btn-secondary ${
                    showReplies ? 'btn-active' : 'btn-outline'
                } gap-2`}
                on:click={() => {
                    showReplies = !showReplies;
                    if (showReplies && !replies) {
                        getReplies();
                    }
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1024 1024"
                    class="h-5 w-5"
                    fill="currentColor"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="10"
                        d="M464 512a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm200 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm-400 0a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm661.2-173.6c-22.6-53.7-55-101.9-96.3-143.3a444.35 444.35 0 0 0-143.3-96.3C630.6 75.7 572.2 64 512 64h-2c-60.6.3-119.3 12.3-174.5 35.9a445.35 445.35 0 0 0-142 96.5c-40.9 41.3-73 89.3-95.2 142.8-23 55.4-34.6 114.3-34.3 174.9A449.4 449.4 0 0 0 112 714v152a46 46 0 0 0 46 46h152.1A449.4 449.4 0 0 0 510 960h2.1c59.9 0 118-11.6 172.7-34.3a444.48 444.48 0 0 0 142.8-95.2c41.3-40.9 73.8-88.7 96.5-142 23.6-55.2 35.6-113.9 35.9-174.5.3-60.9-11.5-120-34.8-175.6zm-151.1 438C704 845.8 611 884 512 884h-1.7c-60.3-.3-120.2-15.3-173.1-43.5l-8.4-4.5H188V695.2l-4.5-8.4C155.3 633.9 140.3 574 140 513.7c-.4-99.7 37.7-193.3 107.6-263.8 69.8-70.5 163.1-109.5 262.8-109.9h1.7c50 0 98.5 9.7 144.2 28.9 44.6 18.7 84.6 45.6 119 80 34.3 34.3 61.3 74.4 80 119 19.4 46.2 29.1 95.2 28.9 145.8-.6 99.6-39.7 192.9-110.1 262.7z"
                    />
                </svg>
                {comment.replies}
            </button>
        </div>
        <div class="collapse min-h-0">
            <input type="checkbox" class="hidden" bind:checked={showReplies} />
            <div class="collapse-content">
                <ul class="menu bg-base-100 w-full rounded-box border border-base-300">
                    <p class="text-lg mx-5 my-3">{$t('common.replies')}</p>
                    <div class="flex items-center mx-5 mb-3">
                        <textarea
                            class="mr-3 textarea textarea-primary w-11/12"
                            placeholder={$t('common.write_reply')}
                            bind:value={reply}
                        />
                        <button
                            class={`ml-3 btn ${
                                reply.length > 0
                                    ? 'btn-outline btn-primary'
                                    : 'btn-ghost btn-disabled'
                            } w-1/12 min-w-fit`}
                            on:click={() => {
                                sendReply();
                            }}>{$t('common.send')}</button
                        >
                    </div>
                    {#if replies}
                        {#each replies as reply}
                            <li>
                                <div class="flex">
                                    <div class="avatar items-center min-w-fit w-1/6">
                                        <div class="w-10 rounded-full">
                                            <img src={reply.user.avatar} alt="Avatar" />
                                        </div>
                                        <p class="ml-2">{reply.user.username}</p>
                                    </div>
                                    <div class="ml-2">
                                        {reply.content}
                                    </div>
                                </div>
                            </li>
                        {/each}
                        <div class="bg-base-100 py-4 min-w-fit">
                            <div class="btn-group flex justify-center min-w-fit mt-12">
                                <button
                                    class={`btn text-4xl ${
                                        previousReplies
                                            ? 'btn-primary btn-outline glass'
                                            : 'btn-ghost btn-disabled'
                                    }`}
                                    on:click={() => {
                                        if (previousReplies) {
                                            getReplies(--page);
                                        }
                                    }}>«</button
                                >
                                <button
                                    class="btn btn-primary w-32 text-lg btn-active glass btn-disabled"
                                    >Page {page}</button
                                >
                                <button
                                    class={`btn text-4xl ${
                                        nextReplies
                                            ? 'btn-primary btn-outline glass'
                                            : 'btn-ghost btn-disabled'
                                    }`}
                                    on:click={() => {
                                        if (nextReplies) {
                                            getReplies(++page);
                                        }
                                    }}>»</button
                                >
                            </div>
                        </div>
                    {:else}
                        Loading...
                    {/if}
                </ul>
            </div>
        </div>
    </div>
</div>
