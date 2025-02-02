import API from '$lib/api';
import { getUserPrivilege } from '$lib/utils';

export const load = async ({ parent, locals, fetch }) => {
  const { user } = await parent();
  const api = new API(fetch, locals.accessToken);
  let status = !user ? 3 : getUserPrivilege(user.role) >= 4 ? 4 : 0;
  const resp = await api.pet.getAnswers({ order: ['subjectiveScore'], desc: [true], perPage: 1 });
  if (status === 0 && resp.ok) {
    const data = (await resp.json()).data;
    if (data.length === 0) {
      status = 1;
    } else if (data[0].subjectiveScore === null) {
      status = 2;
    }
  }
  return {
    status,
  };
};
