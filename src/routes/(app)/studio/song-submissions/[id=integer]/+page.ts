import * as api from '$lib/api';
import type { SongSubmission } from '$lib/models';
import { Status } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ params, parent,fetch }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`/song_uploads/${params.id}/?query_chapters=1&query_uploader=1`, access_token, user, fetch);
    if (!resp.ok) {
        throw error(resp.status, resp.statusText);
    }
    const json = await resp.json();
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as SongSubmission) : null,
        error: resp.ok ? null : json.detail
    };
};
