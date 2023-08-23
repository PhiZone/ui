export const load = async ({ locals }) => {
  return {
    accessToken: locals.accessToken,
    user: locals.user,
    lastRetrieval: locals.lastRetrieval,
  };
};
