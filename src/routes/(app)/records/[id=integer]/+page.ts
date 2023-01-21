import * as api from '$lib/api';
import type { Record } from '$lib/models';
import { Status } from '$lib/constants';
import { getGrade } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ params, parent, fetch }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`/records/${params.id}/?query_song=1&query_player=1&query_relation=1`, access_token, user, fetch);
    if (!resp.ok) {
        throw error(resp.status, resp.statusText);
    }
    const json = await resp.json();
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as Record) : null,
        grade: resp.ok ? getGrade(json.score, json.full_combo) : null,
        error: resp.ok ? null : json.detail,
    };
};
