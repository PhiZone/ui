import queryString from 'query-string';

export const load = async ({ data, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  searchParams.rangeType = [0, 1, 2, 3, 4, 5, 6];
  await queryClient.prefetchQuery(api.application.list(searchParams));
  return {
    searchParams,
    page,
    preferredApplication: data.preferredApplication,
  };
};
