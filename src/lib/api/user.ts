import { serialize } from 'object-to-formdata';
import queryString from 'query-string';
import type { UserDto, UserDetailedDto } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
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

// update
export interface UpdateOpts {
  id: number;
  username?: string;
  avatar?: Blob;
  gender?: string;
  bio?: string;
  language?: string;
  is_active?: boolean;
  date_of_birth?: string;
}

export interface UpdateResult {
  username: string;
  avatar: string;
  gender: number;
  bio: string;
  language: string;
  is_active: boolean;
  date_of_birth: string;
}

export default class UserAPI {
  constructor(private api: API) {}

  me() {
    return this.api.GET<ResponseDto<UserDetailedDto>>('/me');
  }

  list = createQueryCreator('user.list', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<UserDto[]>>('/users?' + stringifyListOpts(opts));
  });

  listFollowers = createQueryCreator('user.list', (opts: RelationListOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<UserDto[]>>(
      `/users/${id}/followers?` + stringifyListOpts(rest)
    );
  });

  listFollowees = createQueryCreator('user.list', (opts: RelationListOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<UserDto[]>>(
      `/users/${id}/followees?` + stringifyListOpts(rest)
    );
  });

  info = createQueryCreator('user.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<UserDto>>(`/users/${id}?` + queryString.stringify(rest));
  });

  update(opts: UpdateOpts) {
    const { id, ...rest } = opts;
    console.log(serialize(rest));
    return this.api.PATCH<FormData | typeof rest, UpdateResult>(
      `/users/${id}/`,
      rest.avatar ? serialize(rest) : rest
    );
  }

  follow(opts: InfoOpts) {
    return this.api.POST<InfoOpts, void>(`/users/${opts.id}/follow`);
  }

  unfollow(opts: InfoOpts) {
    return this.api.POST<InfoOpts, void>(`/users/${opts.id}/unfollow`);
  }
}
