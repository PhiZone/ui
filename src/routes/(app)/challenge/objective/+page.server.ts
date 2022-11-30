import { GET } from '$lib/api';
import { Status } from '$lib/constants';

export const load: import('./$types').PageServerLoad = async ({ locals }) => {
    const resp = await GET('challenge/', locals.access_token);
    if (resp.ok) {
        return {
            status: Status.OK,
            questions: await resp.json(),
            error: null,
        };
    } else {
        return {
            status: Status.ERROR,
            questions: null,
            error: (await resp.json()).error,
        };
    }
};
