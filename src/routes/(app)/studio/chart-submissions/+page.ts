import queryString from 'query-string';
import { getUserPrivilege } from '$lib/utils';

export const load = async ({ url, parent }) => {
  const { api, queryClient, user } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  if (user && getUserPrivilege(user.type) < 3) searchParams.uploader = user.id;
  await queryClient.prefetchQuery(api.chart.submission.list(searchParams));
  return {
    searchParams,
    page,
  };
};
