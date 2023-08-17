import type API from '.';
import { createQueryCreator, type Q } from './common';

export interface SetOpts {
  headline: string;
  duration?: number;
}

export interface Headline {
  headline: string | null;
}

export default class HeadlineAPI {
  constructor(private api: API) {}

  get = createQueryCreator('headline.get', (_opts: void): Q<Headline> => {
    return this.api.GET('/headline');
  });

  set(opts: SetOpts) {
    return this.api.POST('/headline', opts);
  }

  get_studio = createQueryCreator('headline.get_studio', (_opts: void): Q<Headline> => {
    return this.api.GET('/studio/headline');
  });

  set_studio(opts: SetOpts) {
    return this.api.POST('/studio/headline', opts);
  }
}
