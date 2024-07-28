import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { user } = await parent();
  if (!user) throw error(401, 'Unauthorized');
  throw redirect(303, `/users/${user.id}${url.search}`);
};
