import * as api from '$lib/api';
import type { Song } from '$lib/models';
import { Status } from '$lib/constants';

export const load: import('./$types').PageLoad = async ({ params, parent }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`songs/${params.id}/?query_chart=1&query_owner=1`, access_token);
    const json = await resp.json();
    console.log(json);
    console.log('Current User:', user ? user.username : 'Anonymous');
    const relationResp = user ? await api.GET(`relations/?followee=${json.owner.id}&follower=${user.id}`, access_token) : null;
    const commentRes = await(await api.GET(`comments/?song=${json.id}&order=id`, access_token)).json();
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as Song) : null,
        error: resp.ok ? null : json.error,
        userRelation: relationResp ? await relationResp.json() : null,
        comments: commentRes.results,
        previousComments: commentRes.previous,
        nextComments: commentRes.next,
        token: access_token,
    };
};
