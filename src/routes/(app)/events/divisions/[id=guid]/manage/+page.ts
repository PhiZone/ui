import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const index = searchParams.index ?? 1;

  await Promise.allSettled([
    queryClient.prefetchQuery(api.event.division.info({ id: params.id })),
    queryClient.prefetchQuery(
      api.event.team.list({ rangeDivisionId: [params.id], ...searchParams }),
    ),
    queryClient.prefetchQuery(api.event.division.listReservedFields({ id: params.id })),
    queryClient.prefetchQuery(
      api.event.team.listReservedFields(
        { rangeDivisionId: [params.id], ...searchParams },
        { enabled: index == 1 },
      ),
    ),
  ]);

  return {
    searchParams,
    id: params.id,
    index,
    page: (searchParams.page ?? 1) as number,
  };
};
