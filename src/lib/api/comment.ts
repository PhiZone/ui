import type { UserDto } from '.';
import type API from '.';
import { stringifyFilter, createQueryCreator } from './common';
import type { FilterBase, R } from './types';

export interface CommentDto {
  id: string;
  resourceId: string;
  content: string;
  language: string;
  owner: UserDto;
  ownerId: number;
  dateCreated: string;
  replyCount: number;
  likeCount: number;
  dateLiked: string | null;
}

export interface Filter extends FilterBase {
  type: string;
  id: string;
  rangeOwnerId?: number[];
  rangeResourceId?: string[];
}

// info
export interface InfoOpts {
  id: string;
}

// create
export interface CreateOpts {
  type: string;
  id: string;
  content: string;
  language: string;
}

export default class CommentAPI {
  constructor(private api: API) {}

  list = createQueryCreator(
    'comment.list',
    ({ type, id, ...rest }: Filter): R<CommentDto[]> =>
      this.api.GET(`/${type}/${id}/comments?` + stringifyFilter(rest)),
  );

  info = createQueryCreator(
    'comment.info',
    ({ id }: InfoOpts): R<CommentDto> => this.api.GET(`/comments/${id}`),
  );

  create({ type, id, ...rest }: CreateOpts): R {
    return this.api.POST(`/${type}/${id}/comments`, rest);
  }

  delete({ id }: InfoOpts): R {
    return this.api.DELETE(`/comments/${id}`);
  }
}
