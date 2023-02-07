import * as api from "$lib/api";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request, fetch }) => {
	const language = request.headers.get("Accept-Language");
	const resp = await api.auth.register(
		await request.json(),
		fetch,
		language ? language : undefined
	);
	return new Response(
		JSON.stringify({
			code: resp.status,
			content: await resp.json(),
		})
	);
};
