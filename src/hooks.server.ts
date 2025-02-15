import type { Handle } from '@sveltejs/kit';

import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import API from '$lib/api';
import { locales } from '$lib/translations/config';
import { getUserPrivilege, parseAcceptLanguage, setTokens } from '$lib/utils';
import { building } from '$app/environment';

export const handle = (async ({ event, resolve }) => {
  if (!building) {
    let accessToken = event.cookies.get('access_token');
    let refreshToken = event.cookies.get('refresh_token');

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
        }
      }

      if (accessToken) {
        const api = new API(event.fetch, accessToken);
        resp = await api.user.me();
        if (resp.ok) {
          event.locals.user = (await resp.json()).data;
          event.cookies.set('last_retrieval', Date.now().toString(), { path: '/' });
        }
      }
    }

    event.locals.accessToken = accessToken;
    event.locals.refreshToken = refreshToken;

    const language =
      event.url.searchParams.get('language') ??
      event.locals.user?.language ??
      event.cookies.get('language') ??
      parseAcceptLanguage(event.request.headers.get('Accept-Language')).find((tag) =>
        locales
          .get()
          .map((str) => str.toLowerCase())
          .includes(tag.toLowerCase()),
      );
    if (language) {
      event.cookies.set('language', language, { path: '/' });
    }

    const userColors = [
      '\x1b[0m',
      '\x1b[100m',
      '\x1b[43m',
      '\x1b[46m',
      '\x1b[41m',
      '\x1b[42m',
      '\x1b[45m',
    ];
    if (event.url.pathname.includes('undefined')) {
      console.warn(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        (event.locals.user
          ? userColors[getUserPrivilege(event.locals.user.role)] +
            event.locals.user.userName +
            '\x1b[0m '
          : '') + 'encountered undefined in pathname',
        event.url.pathname,
      );
      return new Response();
    }
    console.log(
      `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
      (event.locals.user
        ? userColors[getUserPrivilege(event.locals.user.role)] +
          event.locals.user.userName +
          '\x1b[0m '
        : '') + event.url.pathname,
    );
  }
  return await resolve(event);
}) satisfies Handle;
