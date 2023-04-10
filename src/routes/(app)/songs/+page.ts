import queryString from 'query-string';
import type { PageLoad } from './$types';

export const load = (async ({ url, parent, fetch }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  await queryClient.prefetchQuery(api.song.list(searchParams));
  return {
    searchParams,
    page,
  };
}) satisfies PageLoad;
