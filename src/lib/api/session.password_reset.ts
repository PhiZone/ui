import type { CommonError } from './common';
import type API from '.';

// request
export interface RequestOpts {
  email: string;
}

// validate
export interface ValidateOpts {
  token: string;
}

// confirm
export interface ConfirmOpts {
  password: string;
  token: string;
}

export interface ConfirmError extends CommonError {
  password: string[];
}

export default class SessionPasswordResetAPI {
  constructor(private api: API) {}

  request(opts: RequestOpts) {
    return this.api.POST<RequestOpts, void>('/password_reset/', opts);
  }

  validate(opts: ValidateOpts) {
    return this.api.POST<ValidateOpts, void>('/password_reset/validate_token/', opts);
  }

  confirm(opts: ConfirmOpts) {
    return this.api.POST<ConfirmOpts, void, ConfirmError>('/password_reset/confirm/', opts);
  }
}
