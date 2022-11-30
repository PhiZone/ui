export const load: import('./$types').LayoutServerLoad = async ({ locals }) => {
    console.log('r1', locals.refresh_token);
    return {
        user: locals.user,
        access_token: locals.access_token,
        refresh_token: locals.refresh_token,
    };
};
