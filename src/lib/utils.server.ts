import type { Cookies } from '@sveltejs/kit';

import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

import type API from './api';

import { setTokens } from './utils';

export const login = async (api: API, token: string, cookies: Cookies) => {
  const resp = await api.auth.token(
    {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'password',
      username: '0',
      password: '0',
    },
    undefined,
    undefined,
    token,
  );

  if (!resp.ok) {
    const error = await resp.json();
    console.error(
      `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
      error,
    );
    return error.error;
  }

  const { access_token, refresh_token } = await resp.json();
  setTokens(cookies, access_token, refresh_token);

  return null;
};
