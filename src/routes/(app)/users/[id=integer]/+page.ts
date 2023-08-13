import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = parseInt(params.id);
  await Promise.allSettled([
    queryClient.prefetchQuery(api.user.info({ id })),
    queryClient.prefetchQuery(api.chart.list({ rangeOwnerId: [id] })),
    queryClient.prefetchQuery(api.song.list({ rangeOwnerId: [id] })),
    queryClient.prefetchQuery(
      api.record.list({ rangeOwnerId: [id], order: 'dateCreated', desc: true }),
    ),
    queryClient.prefetchQuery(api.record.list({ rangeOwnerId: [id], order: 'rks', desc: true })),
    // queryClient.prefetchQuery(api.comment.list({ rangeOwnerId: [id] })),
  ]);
  return { searchParams, id };
};
