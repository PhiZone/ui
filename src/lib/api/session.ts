import type API from '.';
import SessionPasswordResetAPI from './session.password_reset';

// register
export interface RegisterOpts {
  username: string;
  email: string;
  password: string;
  gender: number;
  language?: string;
}

// activate
export interface ActivateOpts {
  code: string;
}

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
    return this.api.POST<RegisterOpts, void>('/register', opts);
  }

  activate(opts: ActivateOpts) {
    return this.api.POST<ActivateOpts, void>('/activate', opts);
  }

  token(opts: URLSearchParams) {
    return this.api.POST<URLSearchParams, TokenResult>('/auth/token', opts);
  }

  revokeToken(opts: RevokeTokenOpts) {
    return this.api.POST<RevokeTokenOpts, void>('/auth/revoke', opts);
  }

  password_reset;
}
