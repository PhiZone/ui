export const load: import('./$types').PageServerLoad = async ({ cookies }) => {
    cookies.set('access_token', '', {
        path: '/'
    });
    cookies.set('refresh_token', '', {
        path: '/'
    });
    return;
};
