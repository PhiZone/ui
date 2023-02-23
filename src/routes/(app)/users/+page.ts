export const load: import('./$types').PageLoad = async ({ parent }) => {
  const { user } = await parent();
  return {
    user,
  };
};
