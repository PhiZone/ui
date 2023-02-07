import { getUserPrivilege } from "$lib/utils";
import { error } from "@sveltejs/kit";

export const load: import("./$types").PageLoad = async ({ parent }) => {
	const { user } = await parent();
	if (getUserPrivilege(user.type) < 1) {
		throw error(403, "Forbidden");
	}
	return;
};
