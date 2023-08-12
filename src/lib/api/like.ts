import type API from '.';
import type { ResponseDto } from './common';

// info
export interface InfoOpts {
  id: number;
}

// like
export interface LikeOpts {
  type: 'comments' | 'replies' | 'charts' | 'songs' | 'chapters';
  id: string;
}

export default class LikeAPI {
  constructor(private api: API) {}

  create(opts: LikeOpts) {
    const { type, id } = opts;
    return this.api.POST<void, ResponseDto<void>>(`${type}/${id}/likes/`);
  }

  remove(opts: LikeOpts) {
    const { type, id } = opts;
    return this.api.DELETE<ResponseDto<void>>(`${type}/${id}/likes/`);
  }
}
