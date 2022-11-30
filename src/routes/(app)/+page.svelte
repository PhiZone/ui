<script>
    import { goto } from '$app/navigation';
    import { t } from '$lib/translations/config';

    let searchText = '',
        error = '';
    let searchType = '0';
</script>

<svelte:head>
    <title>{$t('common.title')}</title>
</svelte:head>
<div class="hero min-h-screen" style="background-image: url(https://placeimg.com/1000/800/arch);">
    <div class="hero-overlay bg-opacity-60" />
    <div class="hero-content text-center">
        <div class="w">
            <img class="logo" src="/favicon.ico" alt="logo" />
            <h1 class="mb-5 text-7xl font-bold">{$t('common.title')}</h1>
            <p class="mb-5 text-lg">
                {$t('home.description')}
            </p>
            <div class="form-control">
                <div class="input-group">
                    <select name={searchType} class="select select-lg select-primary">
                        <option selected value="0">{$t('common.songs')}</option>
                        <option value="1">{$t('common.users')}</option>
                        <option value="2">{$t('common.discussions')}</option>
                    </select>
                    <input
                        type="text"
                        placeholder={$t('common.search_placeholder')}
                        class="input input-lg input-primary"
                        bind:value={searchText}
                        on:input={() => {
                            if (error === 'input_null' && searchText) {
                                error = '';
                            }
                            if (searchText.length > 100) {
                                error = 'text_too_long';
                            } else if (error === 'text_too_long') {
                                error = '';
                            }
                        }}
                    />
                    {#if error}
                        <div
                            class="tooltip tooltip-open tooltip-error"
                            data-tip={$t(`common.${error}`)}
                        >
                            <button class={`btn btn-lg btn-square btn-error`}>
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
                    {:else}
                        <button
                            class={`btn btn-lg btn-square ${
                                searchText ? 'btn-accent' : 'btn-primary'
                            }`}
                            on:click={() => {
                                if (!error) {
                                    if (!searchText) {
                                        error = 'input_null';
                                    } else {
                                        goto(
                                            `/search?type=${searchType}${
                                                searchText ? `&name=${searchText}` : ''
                                            }`
                                        );
                                    }
                                }
                            }}
                        >
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
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    * {
        font-family: 'Saira', sans-serif;
    }

    .logo {
        margin: 10px auto 20px;
        display: block;
    }
    .hero-content {
        color: rgb(251, 253, 255);
        width: 100%;
    }
    .w {
        width: 80%;
        max-width: 850px;
    }
    .select {
        max-width: 30%;
        color: rgb(24, 24, 24);
    }
    .input {
        color: rgb(24, 24, 24);
        width: 100%;
    }
</style>
