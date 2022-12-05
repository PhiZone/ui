import * as api from '$lib/api';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const resp = await api.auth.register(await request.json());
    if (!resp.ok) {
        let err, respClone = resp.clone();
        try {
            err = await resp.json();
        } catch (e) {
            err = await respClone.text();
        }
        console.log(resp.status);
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
    console.log(resp.status);
    return new Response(null, {
        status: 303,
        headers: {
            location: '/session/email-confirmation',
        },
    });
};
