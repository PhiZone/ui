import * as api from '$lib/api';
import type { RecorderRequest } from '$lib/models';
import { Status } from '$lib/constants';

export const load: import('./$types').PageLoad = async ({ params, parent }) => {
    const { user, access_token } = await parent();
    const resp = await api.GET(`recorder/requests/${params.id}/`, access_token, user);
    const json = await resp.json();
    console.log(json);
    return {
        status: resp.ok ? Status.OK : Status.ERROR,
        content: resp.ok ? (json as RecorderRequest) : null,
        error: resp.ok ? null : json.error,
        token: access_token,
        user
    };
};
