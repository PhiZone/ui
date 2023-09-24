import type API from '.';
import type { R } from './types';

export interface LikeOpts {
  type: 'comments' | 'replies' | 'records' | 'charts' | 'songs' | 'chapters';
  id: string;
}

export default class LikeAPI {
  constructor(private api: API) {}

  like({ type, id }: LikeOpts): R {
    return this.api.POST(`/${type}/${id}/likes/`);
  }

  unlike({ type, id }: LikeOpts): R {
    return this.api.DELETE(`/${type}/${id}/likes/`);
  }
}
