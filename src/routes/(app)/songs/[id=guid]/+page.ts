import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await Promise.allSettled([
    queryClient.prefetchQuery(api.song.info({ id: params.id })),
    queryClient.prefetchQuery(api.chart.listAll({ rangeSongId: [params.id] })),
    queryClient.prefetchQuery(api.song.listAllAdmitters({ id: params.id })),
    queryClient.prefetchQuery(
      api.comment.list({
        type: 'songs',
        id: params.id,
        page: 1,
        order: ['likeCount', 'dateCreated'],
        desc: [true, true],
      }),
    ),
  ]);

  return {
    searchParams,
    id: params.id,
  };
};
