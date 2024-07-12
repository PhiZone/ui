import queryString from 'query-string';

export const load = async ({ url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const code = searchParams.code as string;
  await queryClient.prefetchQuery(api.event.team.infoInvite({ code }));
  return {
    code,
    url,
  };
};
