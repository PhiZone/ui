import API from '$lib/api';
import type { ResponseDto } from '$lib/api/common';
import { fail } from '@sveltejs/kit';

export const actions = {
  default: async ({ request, fetch, locals }) => {
    const api = new API(fetch, locals.access_token, locals.user);

    const data = await request.formData();
    const username =
      data.get('username') === data.get('old_username')
        ? undefined
        : (data.get('username') as string);

    const resp = await api.user.update({
      id: parseInt(data.get('id') as string),
      username,
      gender: data.get('gender') as string,
      language: data.get('language') as string,
      bio: data.get('bio') as string,
    });
    if (resp.ok) return await resp.json();
    const err = (await resp.json()) as unknown as ResponseDto<void>;
    return fail(resp.status, { error: err.code });
  },
};
