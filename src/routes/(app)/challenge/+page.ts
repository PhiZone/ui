import { getUserPrivilege } from '$lib/utils';

export const load: import('./$types').PageLoad = async ({ parent }) => {
    const { user } = await parent();
    let status = 0;
    console.log(user);
    if (!user) {
        status = 2;
    }
    if (user && getUserPrivilege(user.type?.toString()) != 1) {
        status = 1;
    }
    return {
        status,
    };
};
