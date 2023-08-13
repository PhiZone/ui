import { fail, redirect } from '@sveltejs/kit';
import { setTokens } from '$lib/utils';
import API from '$lib/api';
import { CLIENT_ID, CLIENT_SECRET } from '$env/static/private';

export const actions = {
  default: async ({ request, cookies, url, fetch, locals }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const formData = await request.formData();
    const email = formData.get('email') as string,
      password = formData.get('password') as string;

    const data = new URLSearchParams();
    data.append('client_id', CLIENT_ID);
    data.append('client_secret', CLIENT_SECRET);
    data.append('grant_type', 'password');
    data.append('username', email);
    data.append('password', password);

    const resp = await api.session.token(data);

    if (!resp.ok) {
      const err = await resp.json();
      console.log(err);
      return fail(resp.status, { email, password, detail: err });
    }

    const { access_token, refresh_token } = await resp.json();
    setTokens(cookies, access_token, refresh_token);

    throw redirect(303, url.searchParams.get('redirect') ?? '/');
  },
};
