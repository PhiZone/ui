import queryString from 'query-string';

export const load = async ({ url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  searchParams.Desc = searchParams.Desc ?? true;
  await queryClient.prefetchQuery(api.record.list(searchParams));
  return {
    searchParams,
    page,
  };
};
