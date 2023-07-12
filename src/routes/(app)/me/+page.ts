import { error, redirect } from '@sveltejs/kit';
import { t } from '$lib/translations/config';

export const load = async ({ parent }) => {
  const { user } = await parent();
  if (!user) throw error(401, t.get('errors.401'));
  throw redirect(303, `/users/${user.id}`);
};
