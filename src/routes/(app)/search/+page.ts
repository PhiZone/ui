import * as api from '$lib/api';
import { Status } from '$lib/constants';

export const load: import('./$types').PageLoad = async ({ parent, url }) => {
    const { user, access_token } = await parent();
    const type = parseInt(url.searchParams.get('type') || '0') % 3;
    const paths = ['songs', 'users', 'discussions'];
    const resp = await api.GET(
        `${paths[type]}/${url.search}${url.search ? '&' : '?'}query_chart=1&query_owner=1`, access_token, user
    );
    const json = await resp.json();
    console.log(json.results);
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        type: type,
        content: resp.ok ? json : null,
        error: resp.ok ? null : json.error,
    };
};
