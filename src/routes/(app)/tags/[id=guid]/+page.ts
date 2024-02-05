export const load = async ({ params, parent }) => {
  const { api, queryClient } = await parent();
  await queryClient.prefetchQuery(api.tag.info({ id: params.id }));
  await queryClient.prefetchQuery(api.song.listTag({ id: params.id }));
  await queryClient.prefetchQuery(api.chart.listTag({ id: params.id }));
  return { id: params.id };
};
