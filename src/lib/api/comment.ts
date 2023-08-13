import type { CommentDto } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  type: string;
  id: string;
  page: number;
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

  list = createQueryCreator('comment.list', (opts: ListOpts) => {
    const { type, id, ...rest } = opts;
    return this.api.GET<ResponseDto<CommentDto[]>>(
      `/${type}/${id}/comments?` + stringifyListOpts(rest),
    );
  });

  info = createQueryCreator('comment.info', (opts: InfoOpts) => {
    return this.api.GET<ResponseDto<CommentDto>>(`/comments/${opts.id}`);
  });

  remove(opts: InfoOpts) {
    return this.api.DELETE<void>(`/comments/${opts.id}`);
  }

  create(opts: CreateOpts) {
    return this.api.POST<CreateOpts, CommentDto>(`/${opts.type}/${opts.id}/comments`, opts);
  }
}
