import { fail, redirect } from '@sveltejs/kit';
import API from '$lib/api';
import { t } from '$lib/translations/config';

export const actions = {
  default: async ({ request, url, locals, fetch }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const data = await request.formData();
    const username = data.get('username') as string,
      email = data.get('email') as string,
      password = data.get('password') as string,
      confirm_password = data.get('confirm_password') as string,
      language = data.get('language') as string;

    if (password !== confirm_password) {
      return fail(400, {
        username,
        email,
        password,
        confirm_password,
        language,
        confirm_password_error: t.get('session.passwords_differ'),
      });
    }

    const resp = await api.session.register({
      username,
      email,
      password,
      language,
    });
    if (!resp.ok) {
      const err = await resp.json();
      return fail(resp.status, {
        username,
        email,
        password,
        confirm_password,
        language,
        username_error: err.username?.[0],
        email_error: err.email?.[0],
        password_error: err.password?.[0],
        detail: err.detail,
      });
    }

    throw redirect(303, '/session/email-confirmation' + url.search);
  },
};
