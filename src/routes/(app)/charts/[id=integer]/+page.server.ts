import API from '$lib/api';
import { fail } from '@sveltejs/kit';

export const actions = {
  vote: async ({ request, params, fetch, locals }) => {
    const api = new API(fetch, locals.access_token, locals.user);
    const data = await request.formData();
    const resp = await api.vote.vote({
      chart: parseInt(params.id),
      arrangement: parseInt(data.get('arrangement') as string),
      feel: parseInt(data.get('feel') as string),
      visual_effects: parseInt(data.get('vfx') as string),
      innovativeness: parseInt(data.get('innovativeness') as string),
      concord: parseInt(data.get('concord') as string),
      impression: parseInt(data.get('impression') as string),
    });
    if (resp.ok) return await resp.json();
    const err = await resp.json();
    return fail(resp.status, { detail: err.detail });
  },
};
