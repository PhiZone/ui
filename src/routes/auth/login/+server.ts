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
        grant_type: 'password',
        username: json.email,
        password: json.password,
    };
    const resp = await api.auth.token(credentials);
    if (!resp.ok) {
        return new Response(JSON.stringify({
            code: resp.status,
            content: await resp.json()
        }));
    }
    const result: AuthLoginResult = await resp.json();
    return new Response(JSON.stringify({
        code: resp.status
    }), {
        headers: setTokens(result.access_token, result.refresh_token),
    });
};
