import { error, redirect } from '@sveltejs/kit';

import { getUserPrivilege } from '$lib/utils';
import { PUBLIC_ENV } from '$env/static/public';

export const load = async ({ parent, url }) => {
  const { user, api } = await parent();
  if (!user) {
    error(401, 'Unauthorized');
  }
  // if (getUserPrivilege(user.role) < 3) {
  //   error(403, 'Forbidden');
  // }
  if (PUBLIC_ENV === 'vercel') {
    const expiry = 30;
    const resp = await api.user.token(expiry);
    if (resp.ok) {
      const data = await resp.json();
      redirect(
        307,
        `https://studio.phi.zone/session/login?token=${data.data.token}&redirect=${url.pathname + url.search}`,
      );
    }
  }
  return { user };
};
