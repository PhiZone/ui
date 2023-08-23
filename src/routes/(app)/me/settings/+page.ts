import { error } from '@sveltejs/kit';
import { getUserPrivilege } from '$lib/utils';
import { t } from '$lib/translations/config';

export const load = async ({ parent }) => {
  const { user } = await parent();
  if (!user) throw error(401, t.get('errors.401'));
  if (getUserPrivilege(user.role) < 1) {
    throw error(403, 'Forbidden');
  }
  return;
};
