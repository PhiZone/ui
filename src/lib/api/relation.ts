import type { Relation } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
} from './common';
import type API from '.';
import { derived, readable, type Readable } from 'svelte/store';
import { createQuery } from '@tanstack/svelte-query';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'follower' | 'followee';
  id?: number | number[];
  follower?: number | number[];
  followee?: number | number[];
}

// info
export interface InfoOpts {
  id: number;
}

// operation
export interface OperationOpts {
  followee: number;
}

// query
export interface QueryOpts {
  id: number;
}

export default class RelationAPI {
  constructor(private api: API) {}

  list = createQueryCreator('relation.list', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<Relation>>('/relations/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('relation.listAll', (opts: ListOpts) => {
    return this.api.GET<Relation[]>('/relations/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('relation.info', (opts: InfoOpts) => {
    return this.api.GET<Relation>(`/relations/${opts.id}/`);
  });

  follow(opts: OperationOpts) {
    return this.api.POST<OperationOpts & { operation: 0 }, Relation>('/relations/', {
      ...opts,
      operation: 0,
    });
  }

  unfollow(opts: OperationOpts) {
    return this.api.POST<OperationOpts & { operation: 1 }, void>('/relations/', {
      ...opts,
      operation: 1,
    });
  }

  is_following(opts: QueryOpts): Readable<boolean> {
    if (this.api._user) {
      return derived(
        createQuery(this.listAll({ followee: opts.id, follower: this.api._user.id })),
        (query) => {
          if (query.isSuccess) return query.data.length > 0;
          return false;
        },
      );
    }
    return readable(false);
  }

  is_followed_by(opts: QueryOpts): Readable<boolean> {
    if (this.api._user) {
      return derived(
        createQuery(this.listAll({ follower: opts.id, followee: this.api._user.id })),
        (query) => {
          if (query.isSuccess) return query.data.length > 0;
          return false;
        },
      );
    }
    return readable(false);
  }
}
