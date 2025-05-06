import queryString from 'query-string';

export const load = async ({ params, url, parent, data }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = params.id;
  await Promise.allSettled([
    queryClient.prefetchQuery(api.chart.submission.info({ id })),
    queryClient.prefetchQuery(
      api.vote.volunteer.listAll({ chartId: id, order: ['dateCreated'], desc: [true] }),
    ),
    queryClient.prefetchQuery(api.chart.submission.listAllCollaborations({ id })),
    queryClient.prefetchQuery(api.chart.submission.asset.listAll({ chartId: id })),
    queryClient.prefetchQuery(api.service.list({ rangeTargetType: [1] })),
  ]);
  if (data.preferredPlayConfiguration) {
    await queryClient.prefetchQuery(
      api.playConfiguration.list({ rangeId: [data.preferredPlayConfiguration] }),
    );
  }
  return {
    searchParams,
    id,
    ...data,
  };
};
