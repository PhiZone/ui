import { getUserPrivilege } from '$lib/utils';

export const load: import('./$types').PageServerLoad = async ({ locals }) => {
    return {
        user: locals.user,
    };
};
