import { getUserPrivilege } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ parent }) => {
  const { user } = await parent();
  if (getUserPrivilege(user.type) < 1) {
    throw error(403, 'Forbidden');
  }
  return;
}) satisfies PageLoad;
