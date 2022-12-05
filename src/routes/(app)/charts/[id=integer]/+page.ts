import * as api from '$lib/api';
import type { Chart } from '$lib/models';
import { Status } from '$lib/constants';

export const load: import('./$types').PageLoad = async ({ params, parent }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`charts/${params.id}/?query_song=1&query_owner=1`, access_token);
    const json = await resp.json();
    console.log(json);
    const relationResp = user ? await api.GET(`relations/?followee=${json.owner.id}&follower=${user.id}`, access_token) : null;
    const commentRes = await(await api.GET(`comments/?chart=${json.id}&order=id`, access_token)).json();
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as Chart) : null,
        error: resp.ok ? null : json.error,
        userRelation: relationResp ? await relationResp.json() : null,
        comments: commentRes.results,
        previousComments: commentRes.previous,
        nextComments: commentRes.next,
        token: access_token,
    };
};
