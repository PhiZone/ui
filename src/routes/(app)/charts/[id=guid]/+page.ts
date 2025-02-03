import queryString from 'query-string';

export const load = async ({ data, params, url, parent }) => {
  const { user, api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = params.id;
  const promises = [
    queryClient.prefetchQuery(api.chart.info({ id, includeAssets: true })),
    queryClient.prefetchQuery(api.chart.listAllAdmitters({ id })),
    queryClient.prefetchQuery(api.chart.leaderboard({ id })),
    queryClient.prefetchQuery(
      api.comment.list({
        type: 'charts',
        id: id,
        page: 1,
        order: ['likeCount', 'dateCreated'],
        desc: [true, true],
      }),
    ),
    queryClient.prefetchQuery(api.authorship.listAll({ rangeResourceId: [id] })),
  ];
  if (user) {
    if (data.preferredPlayConfiguration) {
      promises.push(
        queryClient.prefetchQuery(
          api.playConfiguration.list({ rangeId: [data.preferredPlayConfiguration] }),
        ),
      );
    }
    if (data.preferredApplication) {
      promises.push(
        queryClient.prefetchQuery(api.application.list({ rangeId: [data.preferredApplication] })),
      );
    }
  }
  await Promise.allSettled(promises);

  return {
    searchParams,
    id,
    preferredPlayConfiguration: data.preferredPlayConfiguration,
    preferredApplication: data.preferredApplication,
  };
};
