import * as api from "$lib/api";
import { Status } from "$lib/constants";
import { error } from "@sveltejs/kit";

export const load: import("./$types").PageServerLoad = async ({
	url,
	locals,
	fetch,
}) => {
	const resp = await api.GET(
		`/recorder/requests/${url.search}`,
		locals.access_token,
		locals.user,
		fetch
	);
	if (!resp.ok) {
		throw error(resp.status, resp.statusText);
	}
	const json = await resp.json();
	return {
		status: resp.ok ? Status.OK : Status.ERROR,
		search: url.search,
		content: resp.ok ? json : null,
		error: resp.ok ? null : json.detail,
	};
};
