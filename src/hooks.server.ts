import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import { clearTokens, setTokens } from '$lib/utils';
import { locale } from '$lib/translations/config';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  console.log(event.url.pathname);
  let accessToken = event.cookies.get('access_token'),
    refreshToken = event.cookies.get('refresh_token');

  if (refreshToken) {
    let resp;

    if (!accessToken) {
      const api = new API(event.fetch);
      resp = await api.auth.token({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      });

      if (resp.ok) {
        ({ access_token: accessToken, refresh_token: refreshToken } = await resp.json());
        setTokens(event.cookies, accessToken, refreshToken);
      } else {
        event.locals.user = undefined;
      }
    }

    if (accessToken) {
      const api = new API(event.fetch, accessToken);
      resp = await api.user.me();
      if (resp.ok) {
        event.locals.user = (await resp.json()).data;
        event.locals.lastRetrieval = Date.now();
      }
    }
  } else {
    event.locals.user = undefined;
  }

  if (event.locals.user) {
    event.locals.accessToken = accessToken;
    event.locals.refreshToken = refreshToken;
  } else {
    clearTokens(event.cookies);
  }

  const lang = event.locals.user?.language;
  if (lang) {
    locale.set(lang);
  }

  return await resolve(event);
}) satisfies Handle;
