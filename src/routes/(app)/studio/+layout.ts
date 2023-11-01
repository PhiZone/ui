import { getUserPrivilege } from '$lib/utils';
import { error } from '@sveltejs/kit';

export const load = async ({ parent }) => {
  const { user } = await parent();
  if (!user) {
    throw error(401, 'Unauthorized');
  }
  if (user && getUserPrivilege(user.role) < 4) {
    throw error(403, 'Forbidden');
  }
};
