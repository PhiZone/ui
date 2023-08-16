import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import { clearTokens, setTokens } from '$lib/utils';
import { locale } from '$lib/translations/config';

export const handle = async ({ event, resolve }) => {
  console.log(event.url.href);
  let access_token = event.cookies.get('access_token'),
    refresh_token = event.cookies.get('refresh_token');

  if (refresh_token) {
    let resp;
    const api = new API(event.fetch, access_token, event.locals.user);
    resp = await api.user.me();
    if (resp.ok) {
      event.locals.user = (await resp.json()).data;
    } else {
      const data = new URLSearchParams();
      data.append('client_id', CLIENT_ID);
      data.append('client_secret', CLIENT_SECRET);
      data.append('grant_type', 'refresh_token');
      data.append('refresh_token', refresh_token);

      resp = await api.session.token(data);

      if (resp.ok) {
        ({ access_token, refresh_token } = await resp.json());
        setTokens(event.cookies, access_token, refresh_token);

        const api = new API(event.fetch, access_token);
        resp = await api.user.me();
        if (resp.ok) event.locals.user = (await resp.json()).data;
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
};
