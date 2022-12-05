import * as api from '$lib/api';
import type { RequestHandler } from './$types';
import { clearTokens } from '../_cookie';

export const GET: RequestHandler = async ({ locals }) => {
    const resp = await api.auth.revokeToken({
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        token: locals.refresh_token,
    });
    if (!resp.ok) {
        let err;
        try {
            err = await resp.json();
        } catch (e) {
            err = await resp.text();
        }
        return new Response(
            JSON.stringify({
                code: resp.status,
                msg: err,
            }),
            {
                status: 400,
            }
        );
    }
    console.log(await resp.text());
    const headers = clearTokens();
    headers.append('Location', '/');
    console.log(headers);

    return new Response(null, {
        status: 303,
        headers: headers,
    });
};
