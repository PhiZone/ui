import { redirect } from '@sveltejs/kit';
import queryString from 'query-string';
import { OFFICIAL_SECTOKEN, FANMADE_SECTOKEN } from '$env/static/private';

export const load = async ({ url, cookies }) => {
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  if (
    searchParams.secToken != OFFICIAL_SECTOKEN &&
    searchParams.secToken != FANMADE_SECTOKEN &&
    cookies.get('sec_token') != OFFICIAL_SECTOKEN &&
    cookies.get('sec_token') != FANMADE_SECTOKEN
  ) {
    throw redirect(303, '/');
  }

  let token = '';
  if (searchParams.secToken) {
    cookies.set('sec_token', searchParams.secToken as string, {
      path: '/',
      maxAge: 1209600,
    });
    token = searchParams.secToken as string;
  } else {
    token = cookies.get('sec_token') as string;
  }

  return {
    official: token == OFFICIAL_SECTOKEN,
  };
};
