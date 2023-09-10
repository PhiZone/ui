import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import { clearTokens, setTokens } from '$lib/utils';
import { locale } from '$lib/translations/config';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  console.log(
    '[DBG 1] handle invoked with',
    event.locals.user?.userName,
    'and access_token',
    event.locals.accessToken,
    'and refresh_token',
    event.locals.refreshToken,
  );
  console.log(event.url.pathname);
  let accessToken = event.cookies.get('access_token'),
    refreshToken = event.cookies.get('refresh_token');

  if (refreshToken) {
    let resp;
    const api = new API(event.fetch, accessToken, event.locals.user);
    getInfo(api, refreshToken);
    resp = await api.auth.token({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    console.log(
      '[DBG 3] token refreshed for',
      event.locals.user?.userName,
      'with access_token',
      accessToken,
      'and refresh_token',
      refreshToken,
    );

    if (resp.ok) {
      ({ access_token: accessToken, refresh_token: refreshToken } = await resp.json());
      setTokens(event.cookies, accessToken, refreshToken);

      const api = new API(event.fetch, accessToken);
      resp = await api.user.me();
      if (resp.ok) {
        event.locals.user = (await resp.json()).data;
        event.locals.lastRetrieval = Date.now();
        console.log(
          '[DBG 4] obtained new user',
          event.locals.user?.userName,
          'with access_token',
          accessToken,
          'and refresh_token',
          refreshToken,
        );
      }
    } else {
      event.locals.user = undefined;
      console.log(
        '[DBG 5] token refresh failed',
        'with access_token',
        accessToken,
        'and refresh_token',
        refreshToken,
      );
    }
  } else {
    event.locals.user = undefined;
    console.log(
      '[DBG 6] no refresh_token present',
      'with access_token',
      accessToken,
      'and refresh_token',
      refreshToken,
    );
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

const getInfo = async (api: API, refreshToken: string) => {
  const resp = await api.user.me();
  if (resp.ok) {
    console.log(
      '[DBG 2] obtained new user',
      (await resp.json()).data.userName,
      'with access_token',
      api.access_token,
      'and refresh_token',
      refreshToken,
    );
  }
};
