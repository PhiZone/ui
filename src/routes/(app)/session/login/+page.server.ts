import { fail, redirect } from '@sveltejs/kit';
import { setTokens } from '$lib/utils';
import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

export const actions = {
  default: async ({ request, cookies, url, fetch, locals }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const data = await request.formData();
    const email = data.get('email') as string,
      password = data.get('password') as string;
    const resp = await api.session.token({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'password',
      username: email,
      password,
    });

    if (!resp.ok) {
      const err = await resp.json();
      return fail(resp.status, { email, password, detail: err.detail });
    }

    const { access_token, refresh_token } = await resp.json();
    setTokens(cookies, access_token, refresh_token);

    throw redirect(303, url.searchParams.get('redirect') ?? '/');
  },
};
