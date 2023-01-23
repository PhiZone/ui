export const load: import('./$types').PageServerLoad = async ({ cookies, locals }) => {
    cookies.set('access_token', '', {
        path: '/'
    });
    cookies.set('refresh_token', '', {
        path: '/'
    });
    locals.user = undefined;
    locals.access_token = undefined;
    locals.refresh_token = undefined;
    return;
};
