import queryString from 'query-string';
import type { UserDto, UserDetailedDto, Gender } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  createQueryCreator,
  formdata,
  type Q,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order?: 'id' | 'userName' | 'gender' | 'rks' | 'experience' | 'dateJoined' | 'dateOfBirth';
  // id?: number | number[];
  // username?: string;
  // gender?: number | number[];
  // language?: string;
  // lowest_rks?: string;
  // highest_rks?: string;
  // lowest_exp?: string;
  // highest_exp?: string;
  // query_relation?: number;
}

// info
export interface InfoOpts {
  id: number;
}

export interface RelationListOpts extends InfoOpts, ListOptsBase {
  rangeType?: number[];
  earliestDateCreated?: string;
  latestDateCreated?: string;
}

// register
export interface RegisterOpts {
  userName: string;
  email: string;
  password: string;
  avatar?: Blob | File;
  gender?: Gender;
  biography?: string;
  language: string;
  regionCode: string;
  dateOfBirth?: string;
}

export default class UserAPI {
  constructor(private api: API) {}

  me(): Q<UserDetailedDto> {
    return this.api.GET('/me');
  }

  list = createQueryCreator(
    'user.list',
    (opts: ListOpts): Q<UserDto[]> => this.api.GET('/users?' + stringifyListOpts(opts)),
  );

  listFollowers = createQueryCreator(
    'user.list',
    ({ id, ...opts }: RelationListOpts): Q<UserDto[]> =>
      this.api.GET(`/users/${id}/followers?` + stringifyListOpts(opts)),
  );

  listFollowees = createQueryCreator(
    'user.list',
    ({ id, ...opts }: RelationListOpts): Q<UserDto[]> =>
      this.api.GET(`/users/${id}/followees?` + stringifyListOpts(opts)),
  );

  info = createQueryCreator(
    'user.info',
    ({ id, ...opts }: InfoOpts): Q<UserDto> =>
      this.api.GET(`/users/${id}?` + queryString.stringify(opts)),
  );

  follow(opts: InfoOpts) {
    return this.api.POST(`/users/${opts.id}/follow`);
  }

  unfollow(opts: InfoOpts) {
    return this.api.POST(`/users/${opts.id}/unfollow`);
  }

  register(opts: RegisterOpts) {
    return this.api.POST('/users', formdata(opts));
  }
}
