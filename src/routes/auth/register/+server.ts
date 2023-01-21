import * as api from '$lib/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, fetch }) => {
    const language = request.headers.get('Accept-Language')
    const resp = await api.auth.register(await request.json(), fetch, language ? language : undefined);
    if (!resp.ok) {
        let err, respClone = resp.clone();
        try {
            err = await resp.json();
        } catch (e) {
            err = await respClone.text();
        }
        return new Response(JSON.stringify(err),
            {
                status: resp.status,
            }
        );
    }
    return new Response(null, {
        status: 303,
        headers: {
            location: '/session/email-confirmation',
        },
    });
};
