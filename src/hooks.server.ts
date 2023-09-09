import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import { clearTokens, setTokens } from '$lib/utils';
import { locale } from '$lib/translations/config';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  console.log(
    '[DBG] handle invoked with',
    event.locals.user?.userName,
    'and IP',
    event.request.headers.get('HTTP_X_REAL_IP'),
    event.request.headers.get('HTTP_CF_CONNECTING_IP'),
    event.request.headers.get('HTTP_X_FORWARDED_FOR'),
  );
  console.log(event.url.pathname);
  let accessToken = event.cookies.get('access_token'),
    refreshToken = event.cookies.get('refresh_token');

  if (refreshToken) {
    let resp;
    const api = new API(event.fetch, accessToken, event.locals.user);
    resp = await api.auth.token({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    console.log(
      '[DBG] token refreshed for',
      event.locals.user?.userName,
      'with IP',
      event.getClientAddress(),
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
          '[DBG] obtained new user',
          event.locals.user?.userName,
          'with IP',
          event.getClientAddress(),
        );
      }
    } else {
      event.locals.user = undefined;
      console.log('[DBG] token refresh failed', 'with IP', event.getClientAddress());
    }
  } else {
    event.locals.user = undefined;
    console.log('[DBG] no refresh_token present', 'with IP', event.getClientAddress());
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
