import { getUserPrivilege } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const load = async ({ parent }) => {
  const { user } = await parent();
  if (!user) {
    error(401, 'Unauthorized');
  }
  if (getUserPrivilege(user.role) < 3) {
    error(403, 'Forbidden');
  }
  return { user };
};
