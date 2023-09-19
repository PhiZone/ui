import queryString from 'query-string';

export const load = async ({ params, url, parent, data }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await Promise.allSettled([
    queryClient.prefetchQuery(api.song.submission.info({ id: params.id })),
  ]);

  return {
    searchParams,
    id: params.id,
    ...data,
  };
};
