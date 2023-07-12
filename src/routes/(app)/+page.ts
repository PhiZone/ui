export const load = async ({ parent }) => {
  const { api, queryClient } = await parent();
  await queryClient.prefetchQuery(api.headline.get());
};
