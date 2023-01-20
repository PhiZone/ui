import * as api from '$lib/api';
import { ContentType, Status } from '$lib/constants';

export const load: import('./$types').PageServerLoad = async ({ url, fetch }) => {
    const token = url.searchParams.get('token');
    if (!token) return { status: Status.WAITING, msg: "token_not_provided", token };
    const resp = await api.POST("/password_reset/validate_token/", { token: token }, undefined, undefined, ContentType.JSON, fetch);
    if (!resp.ok) return { status: Status.ERROR, msg: (await resp.json()).error, token };
    return { status: Status.OK, token };
};
