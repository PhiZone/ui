import { fail, redirect } from '@sveltejs/kit';
import API from '$lib/api';
import type { ResponseDtoError } from '$lib/api/common.js';

export const actions = {
  default: async ({ request, url, fetch, locals }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const formData = await request.formData();
    const code = formData.get('code') as string;

    const resp = await api.auth.activate({ code });

    if (!resp.ok) {
      const err = (await resp.json()) as unknown as ResponseDtoError;
      console.log(err);
      return fail(resp.status, { code, error: err.code });
    }

    throw redirect(303, url.searchParams.get('redirect') ?? '/');
  },
};
