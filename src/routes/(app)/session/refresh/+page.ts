import { goto } from '$app/navigation';
import { error } from '@sveltejs/kit';
import { Error } from '$lib/constants';
import { browser } from '$app/environment';

export const prerender = false;

export const load: import('./$types').PageLoad = async ({ parent, fetch, url }) => {
    if (browser) {
        const { refresh_token } = await parent();
        console.log('r2', refresh_token);
        const resp = await fetch('/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refresh_token }),
        });
        if (resp.ok) {
            const redirect = url.searchParams.get('redirect');
            console.log('success', redirect);
            goto(redirect ? redirect : '/');
        } else {
            const detail = await resp.json();
            try {
                if (detail.msg.error === Error.INVALID_GRANT) {
                    goto('/session/login' + url.search);
                } else {
                    console.log('error', detail);
                    throw error(400, detail);
                }
            } catch (e) {
                console.log('error', detail);
                goto('/session/login' + url.search);
            }
        }
    }
    return {};
};
