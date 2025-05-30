import { fail, redirect } from '@sveltejs/kit';

import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import API from '$lib/api';
import { setTokens } from '$lib/utils';
import { login } from '$lib/utils.server';

export const load = async ({ url, fetch, cookies }) => {
  if (!url.searchParams.has('token')) return {};
  const api = new API(fetch);
  const redirectUri = url.searchParams.get('redirect');
  const external = redirectUri != null && redirectUri.startsWith('http');
  let result = await login(api, url.searchParams.get('token') ?? '', cookies);
  if (result === 'invalid_token') {
    result = 'error.InvalidToken';
  } else if (result !== null) {
    result = 'session.login.' + result;
  }
  redirect(
    303,
    `${redirectUri ?? (result ? '' : '/')}${
      external
        ? ''
        : result !== null
          ? `?level=error&message=${result}&t=true`
          : '?level=success&message=session.login.success&t=true'
    }`,
  );
};

export const actions = {
  default: async ({ request, cookies, url, fetch }) => {
    const api = new API(fetch);
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

    redirect(303, url.searchParams.get('redirect') ?? '/');
  },
};
