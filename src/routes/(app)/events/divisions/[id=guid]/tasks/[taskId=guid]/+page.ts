import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await queryClient.prefetchQuery(api.event.task.info({ id: params.taskId }));

  return {
    searchParams,
    divisionId: params.id,
    id: params.taskId,
  };
};
