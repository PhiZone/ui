import * as api from '$lib/api';
import type { TokenOpts } from '$lib/api/auth';
import type { RequestHandler } from './$types';
import { setTokens } from '../_cookie';

interface AuthLoginResult {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: 'Bearer';
}

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
    try {
        const result: AuthLoginResult = await resp.json();
        return new Response(null, {
            status: 200,
            headers: setTokens(result.access_token, result.refresh_token),
        });
    } catch (e) {
        console.log(await resp.text());
        return new Response(null, {
            status: 500,
        });
    }
};
