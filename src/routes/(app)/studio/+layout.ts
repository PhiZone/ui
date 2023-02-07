import { getUserPrivilege } from "$lib/utils";
import { error } from "@sveltejs/kit";

export const load: import("./$types").LayoutLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) {
		throw error(401, "Unauthorized");
	}
	if (user && getUserPrivilege(user.type) < 2) {
		throw error(403, "Forbidden");
	}
};
