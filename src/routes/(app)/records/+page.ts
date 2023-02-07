import * as api from "$lib/api";
import { Status } from "$lib/constants";
import { error } from "@sveltejs/kit";

export const load: import("./$types").PageLoad = async ({
	url,
	parent,
	fetch,
}) => {
	const { user, access_token } = await parent();
	const resp = await api.GET(
		`/records/${url.search}${
			url.search ? "&" : "?"
		}query_song=1&query_player=1`,
		access_token,
		user,
		fetch
	);
	if (!resp.ok && ![401].includes(resp.status)) {
		throw error(resp.status, resp.statusText);
	}
	const json = await resp.json();

	return {
		status: resp.ok ? Status.OK : Status.ERROR,
		content: resp.ok ? json : null,
		error: resp.ok ? null : json.detail,
	};
};
