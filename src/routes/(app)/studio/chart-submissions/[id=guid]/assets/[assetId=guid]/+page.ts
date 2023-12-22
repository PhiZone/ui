import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await Promise.allSettled([
    queryClient.prefetchQuery(api.chart.submission.info({ id: params.id })),
    queryClient.prefetchQuery(
      api.chart.submission.asset.info({ chartId: params.id, id: params.assetId }),
    ),
  ]);

  return {
    searchParams,
    id: params.assetId,
    chartId: params.id,
  };
};
