import queryString from 'query-string';

export const load = async ({ data, params, url, parent }) => {
  const { user, api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = params.id;
  await Promise.allSettled([
    queryClient.prefetchQuery(api.chart.info({ id })),
    queryClient.prefetchQuery(api.chart.listAllAdmitters({ id })),
    queryClient.prefetchQuery(
      api.record.listChart({ chartId: id, order: ['rks', 'dateCreated'], desc: [true, true] }),
    ),
    queryClient.prefetchQuery(
      api.comment.list({
        type: 'charts',
        id: id,
        page: 1,
        order: ['likeCount', 'dateCreated'],
        desc: [true, true],
      }),
    ),
    queryClient.prefetchQuery(api.chart.asset.list({ ...searchParams, chartId: id })),
  ]);
  if (data.preferredPlayConfiguration && user) {
    await queryClient.prefetchQuery(
      api.playConfiguration.list({ rangeId: [data.preferredPlayConfiguration] }),
    );
  }
  if (data.preferredApplication && user) {
    await queryClient.prefetchQuery(api.application.list({ rangeId: [data.preferredApplication] }));
  }

  return {
    searchParams,
    id,
    preferredPlayConfiguration: data.preferredPlayConfiguration,
    preferredApplication: data.preferredApplication,
  };
};
