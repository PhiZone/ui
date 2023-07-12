import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import API from '$lib/api';
import { clearTokens } from '$lib/utils';

export const load = async ({ cookies, locals, fetch }) => {
  const api = new API(fetch, locals.access_token, locals.user);
  const refresh_token = locals.refresh_token!;
  await api.session.revokeToken({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    token: refresh_token,
  });
  clearTokens(cookies);

  return {
    api,
  };
};
