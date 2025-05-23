import { error } from '@sveltejs/kit';
import queryString from 'query-string';

export const load = async ({ url, data, parent }) => {
  const { user } = await parent();
  if (!user) error(401, 'Unauthorized');
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  searchParams.rangeOwnerId ??= user.id;
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  return {
    form: data.form,
    preferredPlayConfiguration: data.preferredPlayConfiguration,
    searchParams,
    page,
    user,
  };
};
