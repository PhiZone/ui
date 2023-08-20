import type API from '.';
import type { R, TypedResponse } from './types';

// token
interface TokenBaseOpts {
  client_id: string;
  client_secret: string;
  grant_type: 'password' | 'refresh_token';
}

export interface TokenPwdOpts extends TokenBaseOpts {
  grant_type: 'password';
  username: string;
  password: string;
}

export interface TokenRefreshOpts extends TokenBaseOpts {
  grant_type: 'refresh_token';
  refresh_token: string;
}

export type TokenOpts = TokenPwdOpts | TokenRefreshOpts;

export interface TokenResult {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: 'Bearer';
}

// revoke
export interface RevokeTokenOpts {
  client_id: string;
  client_secret: string;
  token: string;
}

// sendEmail
export enum SendEmailMode {
  EmailConfirmation,
  PasswordReset,
  AccountRevocation,
}

export interface SendEmailOpts {
  email: string;
  mode: SendEmailMode;
}

// resetPassword
export interface ResetPasswordOpts {
  code: string;
  password: string;
}

// activate
export interface ActivateOpts {
  code: string;
}

// taptap
export interface TaptapOpts {
  accessToken?: string;
  macKey?: string;
  unionId?: string;
}

// revokeAccount
export interface RevokeAccountOpts {
  code: string;
}

export default class AuthAPI {
  constructor(private api: API) {
    // this.password_reset = new SessionPasswordResetAPI(api);
  }

  token(opts: TokenOpts): Promise<TypedResponse<true, TokenResult> | TypedResponse<false>> {
    return this.api.POST('/auth/token', new URLSearchParams({ ...opts }));
  }

  revokeToken(opts: RevokeTokenOpts) {
    return this.api.POST('/auth/revoke', new URLSearchParams({ ...opts }));
  }

  sendEmail(opts: SendEmailOpts): R {
    return this.api.POST('/auth/sendEmail', opts);
  }

  resetPassword(opts: ResetPasswordOpts): R {
    return this.api.POST('/auth/resetPassword', opts);
  }

  activate(opts: ActivateOpts): R {
    return this.api.POST('/auth/activate', opts);
  }

  taptap(opts: TaptapOpts) {
    return this.api.POST('/auth/tapTap', opts);
  }

  revokeAccount(opts: RevokeAccountOpts): R {
    return this.api.POST('/auth/revokeAccount', opts);
  }
}
