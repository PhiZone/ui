import queryString from 'query-string';
import type { PageLoad } from './$types';

export const load = (async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = parseInt(params.id);
  await Promise.allSettled([
    queryClient.prefetchQuery(api.user.info({ id })),
    queryClient.prefetchQuery(api.chart.list({ owner: id })),
    queryClient.prefetchQuery(api.song.list({ uploader: id })),
    queryClient.prefetchQuery(api.record.list({ player: id })),
    queryClient.prefetchQuery(api.record.list({ player: id, order_by: 'rks', order: 'desc' })),
    queryClient.prefetchQuery(api.comment.list({ user: id })),
  ]);
  return { searchParams, id };
}) satisfies PageLoad;
