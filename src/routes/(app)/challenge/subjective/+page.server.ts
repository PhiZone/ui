import { ContentType, Status } from '$lib/constants';
import * as api from '$lib/api';

export const load: import('./$types').PageServerLoad = async ({ url, locals, fetch }) => {
    const answers = url.searchParams.get('answers');
    const resp = await api.POST(
        "/challenge/",
        {
            answers: answers,
        },
        locals.access_token, locals.user, ContentType.JSON, fetch
    );
    if (resp.ok) {
        return {
            status: Status.OK,
            questions: await resp.json(),
            error: null,
        };
    } else {
        return {
            status: Status.ERROR,
            questions: null,
            error: (await resp.json()).detail,
            access_token: locals.access_token,
            user: locals.user
        };
    }
};
