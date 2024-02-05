import { fail, redirect } from '@sveltejs/kit';
import { setTokens } from '$lib/utils';
import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

export const actions = {
  default: async ({ request, cookies, url, fetch, locals }) => {
    const api = new API(fetch, locals.accessToken);
    const formData = await request.formData();
    const email = formData.get('email') as string,
      password = formData.get('password') as string;

    const resp = await api.auth.token({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'password',
      username: email,
      password: password,
    });

    if (!resp.ok) {
      const error = await resp.json();
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        error,
      );
      return fail(resp.status, { email, password, error: error.error as string });
    }

    const { access_token, refresh_token } = await resp.json();
    setTokens(cookies, access_token, refresh_token);

    throw redirect(303, url.searchParams.get('redirect') ?? '/');
  },
};
