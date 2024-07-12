import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await queryClient.prefetchQuery(api.service.info({ id: params.id }));

  return {
    searchParams,
    id: params.id,
  };
};
