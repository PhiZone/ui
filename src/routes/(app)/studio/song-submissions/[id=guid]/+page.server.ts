import API from '$lib/api';
import { fail } from '@sveltejs/kit';

export const actions = {
  review: async ({ request, params, fetch, locals }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const data = await request.formData();
    const resp = await api.song.submission.review({
      id: params.id,
      status: parseInt(data.get('attitude') as string),
      isOriginal: (data.get('isOriginal') as string) === 'on',
      isHidden: (data.get('isHidden') as string) === 'on',
      message: data.get('message') as string,
    });
    if (resp.ok) {
      return;
    }
    const err = await resp.json();
    return fail(resp.status, { error: err.code });
  },
};
