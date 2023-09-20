import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });

  await Promise.allSettled([
    queryClient.prefetchQuery(api.chapter.info({ id: params.id })),
    queryClient.prefetchQuery(api.chapter.listSongs({ id: params.id })),
    queryClient.prefetchQuery(
      api.comment.list({
        type: 'chapters',
        id: params.id,
        page: 1,
        order: ['dateCreated'],
        desc: [true],
      }),
    ),
  ]);

  return {
    searchParams,
    id: params.id,
  };
};
