import { error, redirect } from '@sveltejs/kit';

export const load = async ({ parent, url }) => {
  const { user } = await parent();
  if (!user) error(401, 'Unauthorized');
  redirect(303, `/users/${user.id}${url.search}`);
};
