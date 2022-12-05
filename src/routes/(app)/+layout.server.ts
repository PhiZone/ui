export const load: import('./$types').LayoutServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
        access_token: locals.access_token,
        refresh_token: locals.refresh_token,
    };
};
