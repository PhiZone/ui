import queryString from 'query-string';

import { getUserPrivilege } from '$lib/utils';

export const load = async ({ url, parent }) => {
  const { api, queryClient, user } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  searchParams.order = searchParams.order ?? ['status', 'dateUpdated'];
  searchParams.desc = searchParams.desc ?? [false, true];
  if (getUserPrivilege(user.role) < 4) searchParams.ownerId = user.id;
  await queryClient.prefetchQuery(api.song.submission.list(searchParams));
  return {
    searchParams,
    page,
  };
};
