import * as api from '$lib/api';
import type { User } from '$lib/models';
import { Status } from '$lib/constants';
import { getUserPrivilege } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ params, parent, fetch }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`/users/${params.id}/?query_relation=1`, access_token, user, fetch);
    if (!resp.ok) {
        throw error(resp.status, resp.statusText);
    }
    const json = await resp.json();
    let songResp, chartResp, commentResp, recentRecordResp, bestRecordResp;
    if (resp.ok) {
        recentRecordResp = await api.GET(`/records/?player=${params.id}&query_song=1`, access_token, user, fetch);
        bestRecordResp = await api.GET(`/records/?player=${params.id}&query_song=1&order=-rks`, access_token, user, fetch);
        commentResp = await api.GET(`/comments/?user=${params.id}&order=-id`, access_token, user, fetch);
        if (getUserPrivilege(json.type) >= 2) {
            songResp = await api.GET(`/songs/?uploader=${params.id}&order=-id`, access_token, user, fetch);
            chartResp = await api.GET(`/charts/?owner=${params.id}&query_song=1&order=-id`, access_token, user, fetch);
        }
    }
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as User) : null,
        error: resp.ok ? null : json.error,
        charts: chartResp && chartResp.ok ? (await chartResp.json()).results : null,
        songs: songResp && songResp.ok ? (await songResp.json()).results : null,
        recentRecords: recentRecordResp && recentRecordResp.ok ? (await recentRecordResp.json()).results : null,
        bestRecords: bestRecordResp && bestRecordResp.ok ? (await bestRecordResp.json()).results : null,
        comments: commentResp && commentResp.ok ? (await commentResp.json()).results : null,
    };
};
