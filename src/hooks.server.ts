import API, { type UserDetailedDto } from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import { clearTokens, setTokens } from '$lib/utils';
import { locale } from '$lib/translations/config';
import type { Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
  console.log(event.url.href);
  let access_token = event.cookies.get('access_token'),
    refresh_token = event.cookies.get('refresh_token');

  if (refresh_token) {
    let resp;
    const api = new API(event.fetch, access_token, event.locals.user);
    resp = await api.user.me();
    if (resp.ok) {
      event.locals.user = (await resp.json()).data as UserDetailedDto;
    } else {
      resp = await api.auth.token({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token,
      });

      if (resp.ok) {
        ({ access_token, refresh_token } = await resp.json());
        setTokens(event.cookies, access_token, refresh_token);

        const api = new API(event.fetch, access_token);
        resp = await api.user.me();
        if (resp.ok) event.locals.user = (await resp.json()).data as UserDetailedDto;
      } else {
        event.locals.user = undefined;
      }
    }
  } else {
    event.locals.user = undefined;
  }

  if (event.locals.user) {
    event.locals.access_token = access_token;
    event.locals.refresh_token = refresh_token;
  } else {
    clearTokens(event.cookies);
  }

  const lang = event.locals.user?.language;
  if (lang) {
    locale.set(lang);
  }

  return await resolve(event);
}) satisfies Handle;
