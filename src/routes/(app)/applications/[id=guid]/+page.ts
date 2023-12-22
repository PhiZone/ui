import queryString from 'query-string';

export const load = async ({ data, params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await queryClient.prefetchQuery(api.application.info({ id: params.id }));

  return {
    searchParams,
    id: params.id,
    preferredApplication: data.preferredApplication,
  };
};
