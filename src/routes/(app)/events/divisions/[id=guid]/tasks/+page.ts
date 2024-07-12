import queryString from 'query-string';

export const load = async ({ params, data, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  const page = typeof searchParams.page === 'number' ? searchParams.page : 1;
  searchParams.page = page;
  searchParams.order = searchParams.order ?? ['type', 'dateExecuted', 'dateCreated'];
  searchParams.rangeDivisionId = [params.id];
  await queryClient.prefetchQuery(api.event.task.list(searchParams));
  return {
    searchParams,
    page,
    id: params.id,
    form: data.form,
  };
};
