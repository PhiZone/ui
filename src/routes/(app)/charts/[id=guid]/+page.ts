import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = params.id;
  await queryClient.prefetchQuery(api.chart.info({ id }));
  // TODO: preload song
  await queryClient.prefetchQuery(
    api.comment.list({ type: 'charts', id: id, page: 1, order: ['likeCount'], desc: [true] }),
  );

  return {
    searchParams,
    id,
  };
};
