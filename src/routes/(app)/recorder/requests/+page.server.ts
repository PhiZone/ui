import * as api from '$lib/api';
import { Status } from '$lib/constants';

export const load: import('./$types').PageServerLoad = async ({ url, locals }) => {
    const resp = await api.GET(
        `recorder/requests/${url.search}`,
        locals.access_token
    );
    const json = await resp.json();
    console.log(json.results);
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        search: url.search,
        content: resp.ok ? json : null,
        error: resp.ok ? null : json.error,
        user: locals.user,
        token: locals.access_token
    };
};
