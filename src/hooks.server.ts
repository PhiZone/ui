import * as cookie from 'cookie';
import type { Handle } from '@sveltejs/kit';
import { getUserDetail } from '$lib/api/userDetail';

export const handle: Handle = async ({ event, resolve }) => {
    const cookies = cookie.parse(event.request.headers.get('cookie') || '');
    console.log(event.url.href);
    event.locals.access_token = cookies.access_token;
    event.locals.refresh_token = cookies.refresh_token;

    if (cookies.access_token) {
        const resp = await getUserDetail(cookies.access_token);
        if (resp.ok) {
            event.locals.user = await resp.json();
            console.log('login success with language', event.locals.user.language.toString());
        } else if (
            cookies.refresh_token &&
            !event.url.pathname.startsWith('/session') &&
            !event.url.pathname.startsWith('/auth')
        ) {
            console.log('refresh required');
            return await new Response(null, {
                status: 303,
                headers: {
                    location: `/session/refresh?redirect=${event.url.pathname}${event.url.search}`,
                },
            });
        } else {
            console.log('not logged in');
        }
    }
    return await resolve(event);
};
