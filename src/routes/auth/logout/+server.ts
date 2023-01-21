import * as api from '$lib/api';
import type { RequestHandler } from './$types';
import { clearTokens } from '../_cookie';

export const POST: RequestHandler = async ({ request }) => {
    const json = await request.json();
    const resp = await api.auth.revokeToken({
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        token: json.refresh_token,
    });
    if (!resp.ok) {
        return new Response(JSON.stringify({
            code: resp.status,
            content: await resp.json()
        }));
    }
    const headers = clearTokens();
    headers.append('Location', '/');
    return new Response(JSON.stringify({
        code: resp.status
    }), {
        headers: headers
    });
};
