import queryString from 'query-string';
import type { PageLoad } from './$types';

export const load = (async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  const id = parseInt(params.id);
  await queryClient.prefetchQuery(api.relation.list({ followee: id, page }));

  return { searchParams, id, page };
}) satisfies PageLoad;
