import * as api from "$lib/api";
import type { Chapter } from "$lib/models";
import { Status } from "$lib/constants";
import { error } from "@sveltejs/kit";

export const load: import("./$types").PageLoad = async ({
	params,
	parent,
	fetch,
}) => {
	const { user, access_token } = await parent();
	const resp = await api.GET(
		`/chapters/${params.id}/?query_owner=1&query_relation=1`,
		access_token,
		user,
		fetch
	);
	if (!resp.ok) {
		throw error(resp.status, resp.statusText);
	}
	const json = await resp.json();
	let songRes, commentRes;
	try {
		if (json.songs > 0)
			songRes = await (
				await api.GET(
					`/songs/?chapter=${json.id}&order=id`,
					access_token,
					user,
					fetch
				)
			).json();
		if (json.comment_count > 0)
			commentRes = await (
				await api.GET(
					`/comments/?chapter=${json.id}&query_user=1&order=-like_count`,
					access_token,
					user,
					fetch
				)
			).json();
	} catch (e) {
		console.log(e);
	}
	return {
		status: resp.ok ? Status.OK : Status.ERROR,
		content: resp.ok ? (json as Chapter) : null,
		error: resp.ok ? null : json.detail,
		songRes,
		commentRes,
	};
};
