import * as api from '$lib/api';
import type { Song } from '$lib/models';
import { Status } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ params, parent, fetch }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`/songs/${params.id}/?query_chapters=1&query_uploader=1&query_relation=1`, access_token, user, fetch);
    if (!resp.ok) {
        throw error(resp.status, resp.statusText);
    }
    const json = await resp.json();

    let commentRes;
    try {
        if (json.comment_count > 0) {
            commentRes = await (await api.GET(`/comments/?song=${json.id}&order=-like_count`, access_token, user, fetch)).json();
        }
    } catch (e) {
        console.log(e);
    }
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as Song) : null,
        error: resp.ok ? null : json.detail,
        commentRes
    };
};
