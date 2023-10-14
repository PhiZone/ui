import { getUserPrivilege } from '$lib/utils';
import API from '$lib/api';

export const load = async ({ parent, locals, fetch }) => {
  const { user } = await parent();
  const api = new API(fetch, locals.accessToken, locals.user);
  let status = !user ? 3 : getUserPrivilege(user.role) >= 2 ? 4 : 0;
  const resp = await api.pet.getAnswers({ order: ['subjectiveScore'], desc: [true], perPage: 1 });
  if (resp.ok) {
    const data = (await resp.json()).data;
    if (data.length === 0) {
      status = 1;
    } else if (!data[0].subjectiveScore) {
      status = 2;
    }
  }
  return {
    status,
  };
};
