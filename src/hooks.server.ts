import * as cookie from "cookie";
import type { Handle } from "@sveltejs/kit";
import { getUserDetail } from "$lib/api/userDetail";
import * as api from "$lib/api";

export const handle = (async ({ event, resolve }) => {
	const cookies = cookie.parse(event.request.headers.get("cookie") || "");
	console.log(event.url.href);
	event.locals.access_token = cookies.access_token;
	event.locals.refresh_token = cookies.refresh_token;
	if (
		!event.url.pathname.startsWith("/session") &&
		!event.url.pathname.startsWith("/auth")
	) {
		if (cookies.refresh_token) {
			let resp;
			if (cookies.access_token) {
				resp = await getUserDetail(cookies.access_token);
			}
			if (resp?.ok) {
				event.locals.user = await resp.json();
			} else {
				event.locals.user = undefined;
				const credentials: api.auth.TokenOpts = {
					client_id: import.meta.env.VITE_CLIENT_ID,
					client_secret: import.meta.env.VITE_CLIENT_SECRET,
					grant_type: "refresh_token",
					refresh_token: cookies.refresh_token,
				};
				const resp = await api.auth.token(credentials);
				if (resp.ok) {
					const json: api.auth.AuthLoginResult = await resp.json();
					event.request.headers.append(
						"cookie",
						cookie.serialize("access_token", json.access_token, {
							path: "/",
							maxAge: 43200,
						})
					);
					event.request.headers.append(
						"cookie",
						cookie.serialize("refresh_token", json.refresh_token, {
							path: "/",
							maxAge: 1296000,
						})
					);
					event.locals.access_token = json.access_token;
					event.locals.refresh_token = json.refresh_token;
				} else {
					event.locals.access_token = undefined;
					event.locals.refresh_token = undefined;
				}
			}
		} else {
			event.locals.user = undefined;
			event.locals.access_token = undefined;
			event.locals.refresh_token = undefined;
		}
	}
	return await resolve(event);
}) satisfies Handle;

// export const handleFetch = (({ request, fetch }) => {
//     if (request.url.startsWith(API_BASE)) {
//         request = new Request(
//             request.url.replace(API_BASE, LOCAL_API_BASE),
//             request
//         );
//     }
//     return fetch(request);
// }) satisfies HandleFetch;
