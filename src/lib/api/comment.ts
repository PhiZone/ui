import type { Comment } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'chart' | 'song' | 'chapter' | 'user' | 'content' | 'creation';
  id?: number | number[];
  chart?: number | number[];
  song?: number | number[];
  chapter?: number | number[];
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
  chart?: number;
  song?: number;
  chapter?: number;
  event?: number;
  content: string;
  language: string;
}

export default class CommentAPI {
  constructor(private api: API) {}

  list = createQueryCreator('comment.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Comment>>('/comments/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('comment.listAll', (opts: ListOpts) => {
    return this.api.GET<Comment[]>('/comments/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('comment.info', (opts: InfoOpts) => {
    return this.api.GET<Comment>(`/comments/${opts.id}/`);
  });

  delete(opts: InfoOpts) {
    return this.api.DELETE<void>(`/comments/${opts.id}/`);
  }

  post(opts: PostOpts) {
    return this.api.POST<PostOpts, Comment>('/comments/', opts);
  }
}
