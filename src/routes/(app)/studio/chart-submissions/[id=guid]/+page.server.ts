import API from '$lib/api';
import { fail } from '@sveltejs/kit';
import { useQueryClient } from '@tanstack/svelte-query';

export const actions = {
  vote: async ({ request, params, fetch, locals }) => {
    const api = new API(fetch, locals.accessToken, locals.user);
    const data = await request.formData();
    const resp = await api.vote.volunteer.create({
      chartId: params.id,
      score: parseInt(data.get('score') as string),
      message: data.get('message') as string,
    });
    if (resp.ok) {
      const queryClient = useQueryClient();
      await queryClient.invalidateQueries(['chart.submission.info', { id: params.id }]);
      return;
    }
    const err = await resp.json();
    return fail(resp.status, { error: err.code });
  },
};
