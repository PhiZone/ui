import { ContentType } from "$lib/constants";
import { POST } from "./utils";

export interface RegisterOpts {
	username: string;
	email: string;
	password: string;
	language?: "en" | "zh-Hans" | "zh-Hant" | "ja";
}

export interface ActivateOpts {
	code: string;
}

export interface TokenPwdOpts {
	client_id: string;
	client_secret: string;
	grant_type: "password";
	username: string;
	password: string;
}

export interface TokenTokenOpts {
	client_id: string;
	client_secret: string;
	grant_type: "refresh_token";
	refresh_token: string;
}

export interface AuthLoginResult {
	access_token: string;
	expires_in: number;
	refresh_token: string;
	scope: string;
	token_type: "Bearer";
}

export function register(
	opts: RegisterOpts,
	fetch?: Function,
	language?: string
) {
	return POST(
		"/register/",
		opts,
		undefined,
		undefined,
		ContentType.JSON,
		fetch,
		language
	);
}

export function activate(opts: ActivateOpts, fetch?: Function) {
	return POST(
		"/activate/",
		opts,
		undefined,
		undefined,
		ContentType.JSON,
		fetch
	);
}
export type TokenOpts = TokenPwdOpts | TokenTokenOpts;

export function token(opts: TokenOpts, fetch?: Function) {
	return POST(
		"/auth/token/",
		opts,
		undefined,
		undefined,
		ContentType.JSON,
		fetch
	);
}

export interface RevokeTokenOpts {
	client_id: string;
	client_secret: string;
	token: string;
}

export function revokeToken(opts: RevokeTokenOpts, fetch?: Function) {
	return POST(
		"/auth/revoke-token/",
		opts,
		undefined,
		undefined,
		ContentType.JSON,
		fetch
	);
}
