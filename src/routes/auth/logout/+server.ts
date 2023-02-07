import * as api from "$lib/api";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
	const json = await request.json();
	const resp = await api.auth.revokeToken({
		client_id: import.meta.env.VITE_CLIENT_ID,
		client_secret: import.meta.env.VITE_CLIENT_SECRET,
		token: json.refresh_token,
	});
	if (!resp.ok) {
		const content = await resp.json();
		console.log(content);
		return new Response(
			JSON.stringify({
				code: resp.status,
				content: content,
			})
		);
	}
	return new Response(
		JSON.stringify({
			code: resp.status,
		})
	);
};
