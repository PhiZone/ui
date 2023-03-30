import * as api from '$lib/api';
import type { Chart } from '$lib/models';
import { Status } from '$lib/constants';
import { error } from '@sveltejs/kit';

export const load: import('./$types').PageLoad = async ({ params, parent, fetch }) => {
  const { user, access_token } = await parent();
  // const resp = await api.GET(`/charts/${params.id}/?query_song=1&query_owner=1&query_levels=1&query_relation=1`, access_token, user, fetch);
  const resp = await api.GET(
    `/charts/${params.id}/?query_song=1&query_owner=1&query_records=1&query_player=1&query_relation=1`,
    access_token,
    user,
    fetch
  );
  if (!resp.ok) {
    throw error(resp.status, resp.statusText);
  }
  const json = await resp.json();
  let commentRes;
  try {
    if (json.comment_count > 0)
      commentRes = await (
        await api.GET(
          `/comments/?chart=${json.id}&query_user=1&order=-like_count`,
          access_token,
          user,
          fetch
        )
      ).json();
  } catch (e) {
    console.log(e);
  }
  return {
    status: resp.ok ? Status.OK : Status.ERROR,
    content: resp.ok ? (json as Chart) : null,
    error: resp.ok ? null : json.detail,
    commentRes,
  };
};
