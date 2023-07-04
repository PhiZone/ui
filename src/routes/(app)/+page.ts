import * as api from '$lib/api';

export const load: import('./$types').PageLoad = async ({ fetch, parent }) => {
  const resp = await api.GET('/headline/', (await parent()).access_token, undefined, fetch);
  let json;
  if (resp.status === 200) {
    json = await resp.json();
  }
  return {
    status: resp.status,
    content: json,
  };
};
