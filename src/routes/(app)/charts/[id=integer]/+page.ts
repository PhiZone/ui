import queryString from 'query-string';
import type { PageLoad } from './$types';

export const load = (async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const id = parseInt(params.id);
  await queryClient.prefetchQuery(api.chart.info({ id }));
  // TODO: preload song
  await queryClient.prefetchQuery(
    api.comment.list({ chart: id, page: 1, order_by: 'creation', order: 'desc' })
  );

  return {
    searchParams,
    id,
  };
}) satisfies PageLoad;
