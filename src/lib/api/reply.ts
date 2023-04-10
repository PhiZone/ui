import type { Reply } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'comment' | 'user' | 'creation';
  id?: number | number[];
  comment?: number | number[];
  user?: number | number[];
  content?: string;
  language?: string;
}

// info
export interface InfoOpts {
  id: number;
}

// post
export interface PostOpts {
  comment: number;
  content: string;
  language: string;
}

export default class ReplyAPI {
  constructor(private api: API) {}

  list = createQueryCreator('reply.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Reply>>('/replies/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('reply.listAll', (opts: ListOpts) => {
    return this.api.GET<Reply[]>('/replies/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('reply.info', (opts: InfoOpts) => {
    return this.api.GET<Reply>(`/replies/${opts.id}/`);
  });

  delete(opts: InfoOpts) {
    return this.api.DELETE<void>(`/replies/${opts.id}/`);
  }

  post(opts: PostOpts) {
    return this.api.POST<PostOpts, Reply>('/replies/', opts);
  }
}
