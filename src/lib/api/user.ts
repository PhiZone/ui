import { serialize } from 'object-to-formdata';
import queryString from 'query-string';
import type { User } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'username' | 'gender' | 'rks' | 'exp';
  id?: number | number[];
  username?: string;
  gender?: number | number[];
  language?: string;
  lowest_rks?: string;
  highest_rks?: string;
  lowest_exp?: string;
  highest_exp?: string;
  query_relation?: number;
}

// info
export interface InfoOpts {
  id: number;
  query_relation?: number;
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

  current(_opts: void) {
    return this.api.GET<User>('/user_detail/');
  }

  list = createQueryCreator('user.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<User>>('/users/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('user.listAll', (opts: ListOpts) => {
    return this.api.GET<User[]>('/users/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('user.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<User>(`/users/${id}/?` + queryString.stringify(rest));
  });

  update(opts: UpdateOpts) {
    const { id, ...rest } = opts;
    console.log(serialize(rest));
    return this.api.PATCH<FormData | typeof rest, UpdateResult>(
      `/users/${id}/`,
      rest.avatar ? serialize(rest) : rest
    );
  }
}
