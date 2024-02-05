import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  searchParams.topRange = searchParams.topRange ?? 100;
  searchParams.neighborhoodRange = searchParams.neighborhoodRange ?? 10;
  const id = params.id;
  await Promise.allSettled([
    queryClient.prefetchQuery(api.chart.info({ id })),
    queryClient.prefetchQuery(
      api.chart.leaderboard({
        id,
        ...searchParams,
      }),
    ),
  ]);

  return {
    searchParams,
    id,
  };
};
