import type API from '.';

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
    return this.api.POST(`/${type}/${id}/likes/`);
  }

  remove(opts: LikeOpts) {
    const { type, id } = opts;
    return this.api.DELETE(`/${type}/${id}/likes/`);
  }
}
