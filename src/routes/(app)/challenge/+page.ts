import { getUserPrivilege } from "$lib/utils";

export const load: import("./$types").PageLoad = async ({ parent }) => {
	const { user } = await parent();
	let status = 0;
	if (!user) {
		status = 2;
	}
	if (user && getUserPrivilege(user.type) != 1) {
		status = 1;
	}
	return {
		status,
	};
};
