import * as api from '$lib/api';
import { Status } from "$lib/constants";

export const load: import('./$types').PageServerLoad = async ({ locals }) => {
    const resp = await api.GET('recorder/status/');
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: await resp.json(),
        user: locals.user,
    };
};
