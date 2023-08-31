import queryString from 'query-string';

export const load = async ({ url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  searchParams.desc = searchParams.desc ?? true;
  searchParams.markAsRead = searchParams.markAsRead ?? true;
  await queryClient.prefetchQuery(api.notification.list(searchParams));
  await queryClient.prefetchQuery(api.user.info({ id: 1 }));
  return { searchParams, page };
};
