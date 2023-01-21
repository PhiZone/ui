import * as api from '$lib/api';
import type { User } from '$lib/models';
import { Status } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ params, parent, fetch }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`/users/${params.id}/?query_relation=1&extra=1&query_song=1`, access_token, user, fetch);
    if (!resp.ok) {
        throw error(resp.status, resp.statusText);
    }
    const json = await resp.json();
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as User) : null,
        error: resp.ok ? null : json.detail,
        charts: resp.ok && json.extra.charts ? json.extra.charts : null,
        songs: resp.ok && json.extra.songs ? json.extra.songs : null,
        recentRecords: resp.ok && json.extra.recent_records ? json.extra.recent_records : null,
        bestRecords: resp.ok && json.extra.best_records ? json.extra.best_records : null,
        comments: resp.ok ? json.extra.comments : null,
    };
};
