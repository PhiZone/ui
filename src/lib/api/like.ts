import type { Like } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';

// likes
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'comment' | 'reply' | 'chart' | 'song' | 'chapter' | 'user';
  id?: number | number[];
  // discussion?: string;
  comment?: number | number[];
  reply?: number | number[];
  chart?: number | number[];
  song?: number | number[];
  chapter?: number | number[];
  user?: number | number[];
}

// info
export interface InfoOpts {
  id: number;
}

// like
export interface LikeOpts {
  discussion?: string;
  comment?: string;
  reply?: string;
  chart?: string;
  song?: string;
  chapter?: string;
}

// unlike
export interface UnlikeOpts {
  id: number;
}

export default class LikeAPI {
  constructor(private api: API) {}

  list = createQueryCreator('like.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Like>>('/likes/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('like.listAll', (opts: ListOpts) => {
    return this.api.GET<Like[]>('/likes/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('like.info', (opts: InfoOpts) => {
    return this.api.GET<Like>(`/likes/${opts.id}/`);
  });

  like(opts: LikeOpts) {
    return this.api.POST<LikeOpts, Like>('/likes/', opts);
  }

  unlike(opts: UnlikeOpts) {
    return this.api.DELETE<void>(`/likes/${opts.id}/`);
  }
}
