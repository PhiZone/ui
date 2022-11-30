export const load: import('./$types').PageServerLoad = async ({ locals }) => {
    return {
        access_token: locals.access_token,
    };
};
