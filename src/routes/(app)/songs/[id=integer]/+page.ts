import queryString from 'query-string';
import type { PageLoad } from './$types';

export const load = (async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = parseInt(params.id);
  await Promise.allSettled([
    queryClient.prefetchQuery(api.song.info({ id })),
    queryClient.prefetchQuery(api.chart.listAll({ song: id })),
    queryClient.prefetchQuery(
      api.comment.list({ song: id, page: 1, order_by: 'creation', order: 'desc' })
    ),
  ]);

  return {
    searchParams,
    id,
  };
}) satisfies PageLoad;
