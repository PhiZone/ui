import * as api from '$lib/api';
import { Status } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageServerLoad = async ({ locals, fetch }) => {
  const resp = await api.GET('/recorder/status/', locals.access_token, locals.user, fetch);
  if (!resp.ok) {
    throw error(resp.status, resp.statusText);
  }
  return {
    status: resp.ok ? Status.OK : Status.ERROR,
    content: await resp.json(),
  };
};
