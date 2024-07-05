import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });

  await Promise.allSettled([
    queryClient.prefetchQuery(api.event.info({ id: params.id })),
    queryClient.prefetchQuery(api.event.listDivisions({ id: params.id })),
    queryClient.prefetchQuery(api.service.list({ rangeResourceId: [params.id] })),
    queryClient.prefetchQuery(
      api.comment.list({
        type: 'events',
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
