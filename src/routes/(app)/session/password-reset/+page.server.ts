import API from '$lib/api';
import { t } from '$lib/translations/config';
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const data = await request.formData();
    const password = data.get('password') as string,
      confirm_password = data.get('confirm_password') as string,
      token = data.get('token') as string;

    if (password !== confirm_password) {
      return fail(400, {
        password,
        confirm_password,
        confirm_password_error: t.get('session.passwords_differ'),
      });
    }

    const resp = await api.auth.password_reset.confirm({ password, token });
    if (!resp.ok) {
      const err = await resp.json();
      return fail(resp.status, {
        password,
        confirm_password,
        password_error: err.password?.[0],
        detail: err.detail,
      });
    }

    throw redirect(303, '/session/login' + url.search);
  },
};
