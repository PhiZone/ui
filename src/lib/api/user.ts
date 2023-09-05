import { stringifyFilter, createQueryCreator } from './common';
import type { FileUpdateOpts, FilterBase, PatchElement, R } from './types';
import type API from '.';
import { serialize } from 'object-to-formdata';

export enum Gender {
  Unset,
  Male,
  Female,
}

export interface UserDto {
  id: number;
  userName: string;
  avatar: string | null;
  gender: Gender;
  region: string;
  language: string;
  biography: string | null;
  role: string;
  experience: number;
  tag: string | null;
  rks: number;
  followerCount: number;
  followeeCount: number;
  dateJoined: Date;
  dateLastLoggedIn: Date | null;
  dateOfBirth: Date | null;
  dateFollowed: Date | null;
}

export interface UserDetailedDto extends UserDto {
  email: string;
  emailConfirmed: boolean;
  notifications: number;
  phoneNumber: string | null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
}

// list
export interface Filter extends FilterBase {
  order?: 'id' | 'userName' | 'gender' | 'rks' | 'experience' | 'dateJoined' | 'dateOfBirth';
}

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
  Avatar?: File;
  Gender?: Gender;
  Biography?: string;
  DateOfBirth?: Date;
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

  register(opts: RegisterOpts): R {
    return this.api.POST('/users', serialize(opts));
  }

  update({ id }: InfoOpts, patch: PatchElement[]): R {
    return this.api.PATCH(`/users/${id}`, patch);
  }

  updateAvatar({ id, ...rest }: FileUpdateOpts): R {
    return this.api.PATCH(`/users/${id}/avatar`, serialize(rest));
  }
}
