import API from '$lib/api';
import { fail } from '@sveltejs/kit';

export const load = async ({ cookies }) => {
  const preferredPlayConfiguration = cookies.get('preferred_play_configuration');
  const preferredApplication = cookies.get('preferred_application');
  return { preferredPlayConfiguration, preferredApplication };
};

export const actions = {
  vote: async ({ request, params, fetch, locals }) => {
    const api = new API(fetch, locals.accessToken);
    const data = await request.formData();
    const resp = await api.vote.create({
      chartId: params.id,
      arrangement: parseInt(data.get('arrangement') as string),
      gameplay: parseInt(data.get('gameplay') as string),
      visualEffects: parseInt(data.get('visualEffects') as string),
      creativity: parseInt(data.get('creativity') as string),
      concord: parseInt(data.get('concord') as string),
      impression: parseInt(data.get('impression') as string),
    });
    if (resp.ok) {
      return;
    }
    const err = await resp.json();
    return fail(resp.status, { error: err.code });
  },
};
