import * as api from '$lib/api';
import { Status } from '$lib/constants';

export const load: import('./$types').PageServerLoad = async ({ url }) => {
    const code = url.searchParams.get('code');
    if (!code) return { status: Status.INPUT_REQUIRED, code: code };
    const resp = await api.auth.activate({ code });
    if (!resp.ok) return { status: Status.ERROR, msg: (await resp.json()).error, code: code };
    return { status: Status.OK, code: code };
};
