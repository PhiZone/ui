import queryString from 'query-string';

export const load = async ({ data, params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  await Promise.allSettled([
    queryClient.prefetchQuery(api.chart.submission.info({ id: params.id })),
    queryClient.prefetchQuery(
      api.chart.submission.asset.list({ ...searchParams, chartId: params.id }),
    ),
  ]);
  return {
    searchParams,
    page,
    params,
    form: data.form,
  };
};
