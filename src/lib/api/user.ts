import { stringifyFilter, createQueryCreator } from './common';
import type { CodeDto, FileUpdateOpts, FilterBase, PatchElement, R } from './types';
import type { HostshipDto } from './event';
import type API from '.';
import { serialize } from 'object-to-formdata';
import type { ApplicationDto } from '.';

export enum Gender {
  Unset,
  Male,
  Female,
}

export interface UserDto {
  applicationLinks: ApplicationUserDto[] | null;
  id: number;
  userName: string;
  avatar: string | null;
  gender: Gender;
  region: RegionDto;
  language: string;
  biography: string | null;
  role: string;
  experience: number;
  tag: string | null;
  rks: number;
  followerCount: number;
  followeeCount: number;
  dateJoined: string;
  dateLastLoggedIn: string | null;
  dateOfBirth: string | null;
  dateFollowed: string | null;
}

export interface UserDetailedDto extends UserDto {
  email: string;
  emailConfirmed: boolean;
  hostships: HostshipDto[];
  notifications: number;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
}

export interface RegionDto {
  code: string;
  id: number;
  name: string;
}

export interface ApplicationUserDto {
  application: ApplicationDto;
  applicationId: string;
  dateCreated: string;
  dateUpdated: string;
  remoteUserId: string | null;
  remoteUserName: string | null;
  userId: number;
}

// list
export interface Filter extends FilterBase {}

// info
export interface InfoOpts {
  id: number;
}

export interface RelationFilter extends InfoOpts, FilterBase {
  rangeType?: number[];
  earliestDateCreated?: Date;
  latestDateCreated?: Date;
}

// register
export interface RegisterOpts {
  UserName: string;
  Email: string;
  Password: string;
  Language: string;
  RegionCode: string;
  Avatar?: Blob;
  Gender?: Gender;
  Biography?: string;
  DateOfBirth?: Date;
}

export interface RegisterWithProviderOpts {
  Language: string;
  RegionCode: string;
  Gender?: Gender;
  Biography?: string;
  DateOfBirth?: Date;
}

export interface RegisterResult {
  token: string;
}

export default class UserAPI {
  constructor(private api: API) {}

  me(): R<UserDetailedDto> {
    return this.api.GET('/me');
  }

  list = createQueryCreator(
    'user.list',
    (opts: Filter): R<UserDto[]> => this.api.GET('/users?' + stringifyFilter(opts)),
  );

  info = createQueryCreator(
    'user.info',
    ({ id }: InfoOpts): R<UserDto> => this.api.GET(`/users/${id}`),
  );

  followers = createQueryCreator(
    'user.list',
    ({ id, ...opts }: RelationFilter): R<UserDto[]> =>
      this.api.GET(`/users/${id}/followers?` + stringifyFilter(opts)),
  );

  followees = createQueryCreator(
    'user.list',
    ({ id, ...opts }: RelationFilter): R<UserDto[]> =>
      this.api.GET(`/users/${id}/followees?` + stringifyFilter(opts)),
  );

  follow({ id }: InfoOpts): R {
    return this.api.POST(`/users/${id}/follow`);
  }

  unfollow({ id }: InfoOpts): R {
    return this.api.POST(`/users/${id}/unfollow`);
  }

  register(opts: RegisterOpts): R<RegisterResult> {
    return this.api.POST('/users', serialize(opts));
  }

  registerWithProvider(
    opts: RegisterWithProviderOpts,
    provider: string,
    code: string,
    state: string,
    redirectUri: string,
  ): R<RegisterResult> {
    return this.api.POST(
      `/users/provider/${provider}?code=${code}&state=${state}&redirectUri=${redirectUri}`,
      opts,
    );
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/users/${id}`, patch);
  }

  updateAvatar({ id, ...rest }: FileUpdateOpts): R {
    return this.api.PATCH(`/users/${id}/avatar`, serialize(rest));
  }

  bind(provider: string, code: string, state: string, redirectUri: string): R {
    return this.api.POST(
      `/me/bindings/${provider}?code=${code}&state=${state}&redirectUri=${redirectUri}`,
    );
  }

  inheritTapTap(opts: CodeDto): R {
    return this.api.POST('/me/bindings/tapTap/inherit', opts);
  }
}
