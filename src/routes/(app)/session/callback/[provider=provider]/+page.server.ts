import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import API from '$lib/api';
import { SUPPORTED_APPS } from '$lib/constants.js';
import { t } from '$lib/translations/config';
import { setTokens } from '$lib/utils';
import { redirect } from '@sveltejs/kit';
import queryString from 'query-string';

export const load = async ({ cookies, url, params, locals, fetch }) => {
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const api = new API(fetch, locals.accessToken);
  const code = searchParams.code as string;
  const state = searchParams.state as string;
  if (searchParams.bind) {
    const resp = await api.user.bind(params.provider, code, state);
    if (!resp.ok) {
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        await resp.json(),
      );
    }
    throw redirect(
      303,
      resp.ok
        ? '/me/settings?level=success&message=session.bind_success&t=true'
        : '/me/settings?level=error&message=session.bind_failure&t=true',
    );
  } else {
    const resp = await api.auth.token(
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'password',
        username: code,
        password: state,
      },
      params.provider,
    );
    if (!resp.ok) {
      const error = await resp.json();
      console.error(
        `\x1b[2m${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\x1b[0m`,
        error,
      );
      throw redirect(
        303,
        `/session/login?level=error&message=${encodeURI(
          error.error === 'invalid_token'
            ? t.get('session.login.invalid_token_link', {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                provider: SUPPORTED_APPS.find(
                  (app) => app.name.toLowerCase() === params.provider.toLowerCase(),
                ),
              })
            : t.get(`session.login.${error.error}`),
        )}`,
      );
    }

    const { access_token, refresh_token } = await resp.json();
    setTokens(cookies, access_token, refresh_token);

    throw redirect(303, url.searchParams.get('redirect') ?? '/');
  }
};
