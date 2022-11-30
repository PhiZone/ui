<script>
    import { t } from '$lib/translations/config';
    import Song from '$lib/components/song.svelte';

    /** @type {import('./$types').PageData} */
    export let data;
    $: ({ status, type, content, error } = data);

    console.log('status', status);
    console.log('content', content);
    console.log('error', error);
</script>

<div class="search form-control">
    <div class="input-group">
        <select class="select select-lg select-primary">
            <option selected>{$t('common.songs')}</option>
            <option>{$t('common.users')}</option>
            <option>{$t('common.discussions')}</option>
        </select>
        <input
            type="text"
            placeholder={$t('common.search_placeholder')}
            class="input input-lg input-primary"
        />
        <button class="btn btn-lg btn-square btn-primary btn-outline glass">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                /></svg
            >
        </button>
    </div>
</div>
{#if type === 0}
    <div class="px-32 result">
        {#each content.results as result}
            <div class="min-w-fit">
                <Song song={result} />
            </div>
        {/each}
    </div>
{/if}

{#if false}
    <div class="overflow-x-auto w-full">
        <table class="table w-full">
            <!-- head -->
            <thead>
                <tr>
                    <th>{$t('search.id')}</th>
                    <th>{$t('song.name')}</th>
                    <th>{$t('song.composer')}</th>
                    <th>{$t('song.illustrator')}</th>
                    <th>{$t('song.bpm')}</th>
                    <th>{$t('song.duration')}</th>
                    <th>{$t('song.uploader')}</th>
                </tr>
            </thead>
            <tbody>
                <!-- row 1 -->
                <tr>
                    <th> 1 </th>
                    <td>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img
                                        src="/tailwind-css-component-profile-2@56w.png"
                                        alt="Avatar Tailwind CSS Component"
                                    />
                                </div>
                            </div>
                            <div>
                                <div class="font-bold">Hart Hagerty</div>
                                <div class="text-sm opacity-50">United States</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        Zemlak, Daniel and Leannon
                        <br />
                        <span class="badge badge-ghost badge-sm">Desktop Support Technician</span>
                    </td>
                    <td>Purple</td>
                    <th>
                        <button class="btn btn-ghost btn-xs">details</button>
                    </th>
                </tr>
                <!-- row 2 -->
                <tr>
                    <th> 2 </th>
                    <td>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img
                                        src="/tailwind-css-component-profile-3@56w.png"
                                        alt="Avatar Tailwind CSS Component"
                                    />
                                </div>
                            </div>
                            <div>
                                <div class="font-bold">Brice Swyre</div>
                                <div class="text-sm opacity-50">China</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        Carroll Group
                        <br />
                        <span class="badge badge-ghost badge-sm">Tax Accountant</span>
                    </td>
                    <td>Red</td>
                    <th>
                        <button class="btn btn-ghost btn-xs">details</button>
                    </th>
                </tr>
                <!-- row 3 -->
                <tr>
                    <th> 3 </th>
                    <td>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img
                                        src="/tailwind-css-component-profile-4@56w.png"
                                        alt="Avatar Tailwind CSS Component"
                                    />
                                </div>
                            </div>
                            <div>
                                <div class="font-bold">Marjy Ferencz</div>
                                <div class="text-sm opacity-50">Russia</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        Rowe-Schoen
                        <br />
                        <span class="badge badge-ghost badge-sm">Office Assistant I</span>
                    </td>
                    <td>Crimson</td>
                    <th>
                        <button class="btn btn-ghost btn-xs">details</button>
                    </th>
                </tr>
                <!-- row 4 -->
                <tr>
                    <th> 4 </th>
                    <td>
                        <div class="flex items-center space-x-3">
                            <div class="avatar">
                                <div class="mask mask-squircle w-12 h-12">
                                    <img
                                        src="/tailwind-css-component-profile-5@56w.png"
                                        alt="Avatar Tailwind CSS Component"
                                    />
                                </div>
                            </div>
                            <div>
                                <div class="font-bold">Yancy Tear</div>
                                <div class="text-sm opacity-50">Brazil</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        Wyman-Ledner
                        <br />
                        <span class="badge badge-ghost badge-sm">Community Outreach Specialist</span
                        >
                    </td>
                    <td>Indigo</td>
                    <th>
                        <button class="btn btn-ghost btn-xs">details</button>
                    </th>
                </tr>
            </tbody>
            <!-- foot -->
            <tfoot>
                <tr>
                    <th>{$t('search.id')}</th>
                    <th>{$t('song.name')}</th>
                    <th>{$t('song.composer')}</th>
                    <th>{$t('song.illustrator')}</th>
                    <th>{$t('song.bpm')}</th>
                    <th>{$t('song.duration')}</th>
                    <th>{$t('song.uploader')}</th>
                </tr>
            </tfoot>
        </table>
    </div>
{/if}

<div class="bg-base-100 py-4">
    <div class="btn-group flex justify-center">
        <button class="btn btn-primary text-4xl btn-outline glass">«</button>
        <button class="btn btn-primary w-32 text-lg btn-active glass btn-disabled">Page 1</button>
        <button class="btn btn-primary text-4xl btn-outline glass">»</button>
    </div>
</div>

<style>
    * {
        font-family: 'Saira', sans-serif;
    }
    .search {
        max-width: 60%;
        margin: 140px auto 50px;
    }
    .select {
        max-width: 30%;
        color: rgb(24, 24, 24);
    }
    .input {
        color: rgb(24, 24, 24);
        width: 100%;
    }
    .result {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        grid-gap: 1.5rem;
    }
</style>
