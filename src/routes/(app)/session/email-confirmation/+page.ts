import type { PageLoad } from './$types';

export const load = (async ({ url, parent }) => {
  const { api } = await parent();
  const code = url.searchParams.get('code');
  if (code) {
    const resp = await api.session.activate({ code });
    if (!resp.ok) {
      const err = await resp.json();
      return {
        code,
        detail: err.detail,
      };
    }
    return {
      code,
    };
  }
}) satisfies PageLoad;
