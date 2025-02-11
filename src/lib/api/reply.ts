import type API from '.';
import type { UserDto } from '.';
import type { FilterBase, R } from './types';

import { createQueryCreator, stringifyFilter } from './common';

export interface ReplyDto {
  id: string;
  commentId: string;
  content: string;
  language: string;
  owner: UserDto;
  ownerId: number;
  dateCreated: string;
  likeCount: number;
  dateLiked: string | null;
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
    return this.api.GET(`/replies/${id}`);
  });

  delete(opts: InfoOpts) {
    return this.api.DELETE(`/replies/${opts.id}`);
  }

  create({ commentId, ...rest }: CreateOpts) {
    return this.api.POST(`/comments/${commentId}/replies`, rest);
  }
}
