<script>
    import { POST } from '$lib/utils';
    import { t } from '$lib/translations/config';
    import { Status } from '$lib/constants';

    /** @type {import('./$types').PageData} */
    export let data;
    $: ({ redirect } = data);

    let email = '';
    let password = '';
    let error_msg = '';

    let status = Status.OK;

    const login = async () => {
        if (!email || !password) {
            error_msg = $t('session.data_incomplete');
            return;
        }
        status = Status.WAITING;
        const resp = await POST('/auth/login', { email, password });
        if (resp.ok) {
            location.href = redirect ? redirect : '/';
        } else {
            status = Status.OK;
            error_msg = $t(
                resp.status == 400 ? 'session.login.invalid_credentials' : 'common.unknown_error'
            );
        }
    };
</script>

<div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse">
        <div class="text text-center lg:text-left">
            <h1 class="text-5xl font-bold">
                {$t('session.login.login')}
            </h1>
            <p class="py-6">
                {$t('session.login.login_text')}
            </p>
        </div>
        <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div class="card-body">
                <div class="form-control">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="label">
                        <span class="label-text">{$t('session.email')}</span>
                    </label>
                    <input
                        type="email"
                        placeholder={$t('session.email')}
                        class="input input-bordered"
                        on:input={() => {
                            error_msg = '';
                        }}
                        bind:value={email}
                    />
                </div>
                <div class="form-control">
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="label">
                        <span class="label-text">{$t('session.password')}</span>
                    </label>
                    <input
                        type="password"
                        placeholder={$t('session.password')}
                        class="input input-bordered"
                        on:input={() => {
                            error_msg = '';
                        }}
                        bind:value={password}
                    />
                    <!-- svelte-ignore a11y-label-has-associated-control -->
                    <label class="label">
                        <a href="/forgot-password" class="label-text-alt link link-hover">
                            {$t('session.login.forgot_password')}</a
                        >
                    </label>
                </div>
                <div class="form-control mt-6">
                    {#if error_msg}
                        <div class="tooltip tooltip-open tooltip-error" data-tip={error_msg}>
                            <button class="btn btn-error">{$t('common.error')}</button>
                        </div>
                    {:else if status == Status.WAITING}
                        <button class={`btn btn-outline btn-ghost btn-disabled glass`}
                            >{$t('common.waiting')}</button
                        >
                    {:else}
                        <button class="btn btn-primary" on:click={login}>
                            {$t('session.login.login')}</button
                        >
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

    .text {
        padding-left: 40px;
    }
</style>
