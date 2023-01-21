import * as cookie from 'cookie';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { getUserDetail } from '$lib/api/userDetail';
import { API_BASE, LOCAL_API_BASE } from '$lib/constants';

export const handle = (async ({ event, resolve }) => {
    const cookies = cookie.parse(event.request.headers.get('cookie') || '');
    console.log(event.url.href);
    event.locals.access_token = cookies.access_token;
    event.locals.refresh_token = cookies.refresh_token;

    if (cookies.refresh_token) {
        let resp;
        if (cookies.access_token && !event.url.pathname.startsWith('/session') && !event.url.pathname.startsWith('/auth')) {
            resp = await getUserDetail(cookies.access_token);
        }
        if (resp?.ok) {
            event.locals.user = await resp.json();
        } else if (
            cookies.refresh_token &&
            !event.url.pathname.startsWith('/session') &&
            !event.url.pathname.startsWith('/auth')
        ) {
            console.log('refresh required');
            return await new Response(null, {
                status: 303,
                headers: {
                    location: `/session/refresh?redirect=${encodeURIComponent(event.url.pathname + event.url.search)}`,
                },
            });
        }
    } else {
        event.locals.user = undefined;
        event.locals.access_token = undefined;
        event.locals.refresh_token = undefined;
    }
    return await resolve(event);
}) satisfies Handle;

// export const handleFetch = (({ request, fetch }) => {
//     if (request.url.startsWith(API_BASE)) {
//         request = new Request(
//             request.url.replace(API_BASE, LOCAL_API_BASE),
//             request
//         );
//     }
//     return fetch(request);
// }) satisfies HandleFetch;