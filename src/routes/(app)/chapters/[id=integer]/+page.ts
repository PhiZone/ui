import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });

  const id = parseInt(params.id);
  await Promise.allSettled([
    queryClient.prefetchQuery(api.chapter.info({ id })),
    queryClient.prefetchQuery(api.song.listAll({ chapter: id })),
    queryClient.prefetchQuery(
      api.comment.list({ chapter: id, page: 1, order_by: 'creation', order: 'desc' })
    ),
  ]);

  return {
    searchParams,
    id,
  };
};
