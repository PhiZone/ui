import * as api from '$lib/api';
import type { TokenOpts } from '$lib/api/auth';
import type { RequestHandler } from './$types';
import { setTokens } from '../_cookie';
import { error } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
    const json = await request.json();
    const credentials: TokenOpts = {
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: json.refresh_token,
    };
    const resp = await api.auth.token(credentials);
    if (!resp.ok) {
        return new Response(JSON.stringify({
            code: resp.status,
            content: await resp.json()
        }));
    }
    try {
        const result: api.auth.AuthLoginResult = await resp.json();
        return new Response(JSON.stringify({
            code: resp.status,
            content: result
        }), {
            headers: setTokens(result.access_token, result.refresh_token),
        });
    } catch (e) {
        console.log(resp.status, e);
        throw error(500, "Internal Error");
    }
};
