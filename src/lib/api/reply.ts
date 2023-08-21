import { stringifyFilter, createQueryCreator } from './common';
import type API from '.';
import type { FilterBase, R } from './types';

export interface ReplyDto {
  id: string;
  commentId: string;
  content: string;
  language: string;
  ownerId: number;
  dateCreated: Date;
  likeCount: number;
  dateLiked: Date | null;
}

export interface Filter extends FilterBase {
  commentId: string;
}

export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  commentId: string;
  content: string;
  language: string;
}

export default class ReplyAPI {
  constructor(private api: API) {}

  list = createQueryCreator('reply.list', ({ commentId, ...rest }: Filter): R<ReplyDto[]> => {
    return this.api.GET(`/comments/${commentId}/replies?` + stringifyFilter(rest));
  });

  listAll = createQueryCreator('reply.listAll', ({ commentId, ...rest }: Filter): R<ReplyDto[]> => {
    return this.api.GET(`/comments/${commentId}/replies?` + stringifyFilter(rest, true));
  });

  info = createQueryCreator('reply.info', ({ id }: InfoOpts): R<ReplyDto> => {
    return this.api.GET(`/replies/${id}/`);
  });

  remove(opts: InfoOpts) {
    return this.api.DELETE(`/replies/${opts.id}`);
  }

  create({ commentId, ...rest }: CreateOpts) {
    return this.api.POST(`/comments/${commentId}/replies`, rest);
  }
}
