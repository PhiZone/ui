import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = params.id;
  await queryClient.prefetchQuery(api.event.info({ id }));

  return {
    searchParams,
    id,
    url,
  };
};
