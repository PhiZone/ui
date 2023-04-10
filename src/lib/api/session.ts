import type { CommonError } from './common';
import type API from '.';
import SessionPasswordResetAPI from './session.password_reset';

// register
export interface RegisterOpts {
  username: string;
  email: string;
  password: string;
  language?: string;
}

export interface RegisterError extends CommonError {
  username?: string[];
  email?: string[];
  password?: string[];
}

// activate
export interface ActivateOpts {
  code: string;
}

// token
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

export interface TokenResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: 'Bearer';
}

// revoke token
export interface RevokeTokenOpts {
  client_id: string;
  client_secret: string;
  token: string;
}

export default class SessionAPI {
  constructor(private api: API) {
    this.password_reset = new SessionPasswordResetAPI(api);
  }

  register(opts: RegisterOpts) {
    return this.api.POST<RegisterOpts, void, RegisterError>('/register/', opts);
  }

  activate(opts: ActivateOpts) {
    return this.api.POST<ActivateOpts, void>('/activate/', opts);
  }

  token(opts: TokenOpts) {
    return this.api.POST<TokenOpts, TokenResult>('/auth/token/', opts);
  }

  revokeToken(opts: RevokeTokenOpts) {
    return this.api.POST<RevokeTokenOpts, void>('/auth/revoke-token/', opts);
  }

  password_reset;
}
