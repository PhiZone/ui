export const load = async ({ locals }) => {
  return {
    access_token: locals.access_token,
    user: locals.user,
  };
};
