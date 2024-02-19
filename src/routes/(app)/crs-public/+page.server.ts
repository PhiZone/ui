import { redirect } from '@sveltejs/kit';
import { OFFICIAL_SECTOKEN, FANMADE_SECTOKEN } from '$env/static/private';

export const load = async ({ cookies }) => {
  if (
    cookies.get('sec_token') == OFFICIAL_SECTOKEN ||
    cookies.get('sec_token') == FANMADE_SECTOKEN
  ) {
    throw redirect(302, '/crs');
  }
  return {};
};
