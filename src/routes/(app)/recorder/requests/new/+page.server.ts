export const load: import('./$types').PageServerLoad = async ({ locals }) => {
    return {
        token: locals.access_token,
        user: locals.user
    };
};
