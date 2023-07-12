import API from '$lib/api';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, locals, fetch }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const data = await request.formData();
    const email = data.get('email') as string;
    const resp = await api.session.password_reset.request({ email });

    if (!resp.ok) {
      const err = await resp.json();
      return fail(resp.status, { email, detail: err.detail });
    } else {
      return { email };
    }
  },
};
