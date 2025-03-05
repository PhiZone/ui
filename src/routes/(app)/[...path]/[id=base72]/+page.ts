import { redirect } from '@sveltejs/kit';

import { base72ToGuid } from '$lib/utils';

export const load = ({ params, url }) => {
  const base72 = params.id;
  const guid = base72ToGuid(base72);
  redirect(302, `${url.pathname.replace(base72, guid)}${url.search}`);
};
