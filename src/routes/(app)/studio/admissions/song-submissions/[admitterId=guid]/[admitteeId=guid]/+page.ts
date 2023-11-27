import queryString from 'query-string';

export const load = async ({ params, url, parent }) => {
  const { api, queryClient } = await parent();
  const searchParams = queryString.parse(url.search, { parseNumbers: true, parseBooleans: true });
  await queryClient.prefetchQuery(
    api.admission.infoSongSubmission({
      admitterId: params.admitterId,
      admitteeId: params.admitteeId,
    }),
  );
  return { searchParams, admitterId: params.admitterId, admitteeId: params.admitteeId };
};
