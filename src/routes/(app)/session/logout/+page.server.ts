import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';
import API from '$lib/api';
import { clearTokens } from '$lib/utils';

export const load = async ({ cookies, locals, fetch }) => {
  const api = new API(fetch, locals.accessToken, locals.user);
  const refreshToken = locals.refreshToken!;
  await api.auth.revokeToken({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    token: refreshToken,
  });
  locals.user = undefined;
  clearTokens(cookies);

  return {
    // api,
  };
};
