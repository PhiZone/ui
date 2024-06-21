import queryString from 'query-string';

export const load = async ({ url, parent, data }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const divisionId = searchParams.divisionId as string;
  await queryClient.prefetchQuery(api.event.division.info({ id: divisionId }));
  return {
    name: searchParams.name as string,
    divisionId,
    ...data,
  };
};
