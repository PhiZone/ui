import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
  return {
    access_token: locals.access_token,
    user: locals.user,
  };
}) satisfies LayoutServerLoad;
