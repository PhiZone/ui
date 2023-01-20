import * as api from '$lib/api';
import { Status } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ parent, url, fetch }) => {
    const { user, access_token } = await parent();
    const type = parseInt(url.searchParams.get('type') || '0') % 3;
    const name = url.searchParams.get('name');
    const paths = ['chapters', 'songs', 'users', 'discussions'];
    let resp, json;
    if (name) {
        resp = await api.GET(
            `/${paths[type]}/${url.search}${url.search ? '&' : '?'}title=${name}&query_chart=1&query_owner=1&query_relation=1`, access_token, user, fetch
        );
        if (!resp.ok) {
            throw error(resp.status, resp.statusText);
        }
        json = await resp.json();
    }
    return {
        status: resp && resp.ok ? Status.OK : Status.ERROR,
        type,
        name,
        content: resp && resp.ok ? json : null,
        error: resp && resp.ok ? null : resp ? json.error : null,
    };
};
