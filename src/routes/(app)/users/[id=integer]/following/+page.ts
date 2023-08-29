import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  const id = parseInt(params.id);
  await queryClient.prefetchQuery(api.user.followees({ id, page }));

  return { searchParams, id, page };
};
