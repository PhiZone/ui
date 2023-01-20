import * as api from '$lib/api';
import { Status } from '$lib/constants';

export const load: import('./$types').PageServerLoad = async ({ url, fetch }) => {
    const code = url.searchParams.get('code');
    if (!code) return { status: Status.WAITING, code: code };
    const resp = await api.auth.activate({ code }, fetch);
    if (!resp.ok) return { status: Status.ERROR, msg: (await resp.json()).detail, code: code };
    return { status: Status.OK, code: code };
};
