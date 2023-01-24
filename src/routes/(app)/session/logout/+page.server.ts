import { POST } from "$lib/utils";

export const load: import('./$types').PageServerLoad = ({ cookies, locals, fetch }) => {
    cookies.set('access_token', '', {
        path: '/',
        maxAge: 0,
    });
    cookies.set('refresh_token', '', {
        path: '/',
        maxAge: 0,
    });
    POST("/auth/logout", {
        refresh_token: locals.refresh_token,
    }, locals.user?.language, fetch);
    locals.user = undefined;
    locals.access_token = undefined;
    locals.refresh_token = undefined;
    return;
};
