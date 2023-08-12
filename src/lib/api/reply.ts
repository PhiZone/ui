import type { ReplyDto } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  id: string;
  // comment?: number | number[];
  // user?: number | number[];
  // content?: string;
  // language?: string;
}

// info
export interface InfoOpts {
  id: number;
}

// post
export interface CreateOpts {
  content: string;
  language: string;
}

export default class ReplyAPI {
  constructor(private api: API) {}

  list = createQueryCreator('reply.list', (opts: ListOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<ResponseDto<ReplyDto[]>>(
      `/comments/${id}/replies?` + stringifyListOpts(rest)
    );
  });

  listAll = createQueryCreator('reply.listAll', (opts: ListOpts) => {
    return this.api.GET<ResponseDto<ReplyDto[]>>('/replies/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('reply.info', (opts: InfoOpts) => {
    return this.api.GET<ResponseDto<ReplyDto>>(`/replies/${opts.id}/`);
  });

  remove(opts: InfoOpts) {
    return this.api.DELETE<void>(`/replies/${opts.id}`);
  }

  create(id: string, opts: CreateOpts) {
    return this.api.POST<CreateOpts, ReplyDto>(`/comments/${id}/replies`, opts);
  }
}
