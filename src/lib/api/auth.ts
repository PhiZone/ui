import { POST } from './utils';

export interface RegisterOpts {
    username: string;
    email: string;
    password: string;
    language?: 'en' | 'zh-Hans' | 'zh-Hant' | 'ja';
}

export function register(opts: RegisterOpts) {
    return POST('register/', opts);
}

export interface ActivateOpts {
    code: string;
}

export function activate(opts: ActivateOpts) {
    return POST('activate/', opts);
}

export interface TokenPwdOpts {
    client_id: string;
    client_secret: string;
    grant_type: 'password';
    username: string;
    password: string;
}

export interface TokenTokenOpts {
    client_id: string;
    client_secret: string;
    grant_type: 'refresh_token';
    refresh_token: string;
}

export type TokenOpts = TokenPwdOpts | TokenTokenOpts;

export function token(opts: TokenOpts) {
    return POST('auth/token/', opts);
}

export interface RevokeTokenOpts {
    client_id: string;
    client_secret: string;
    token: string;
}

export function revokeToken(opts: RevokeTokenOpts) {
    return POST('auth/revoke-token/', opts);
}
