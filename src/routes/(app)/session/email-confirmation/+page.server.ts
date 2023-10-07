import { fail, redirect } from '@sveltejs/kit';
import API from '$lib/api';

export const actions = {
  default: async ({ request, url, fetch, locals }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const formData = await request.formData();
    const code = formData.get('code') as string;

    const resp = await api.auth.activate({ code });

    if (!resp.ok) {
      const error = await resp.json();
      console.log(error);
      return fail(resp.status, { code, error: error.code });
    }

    throw redirect(303, url.searchParams.get('redirect') ?? '/session/login');
  },
};
