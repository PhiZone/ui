import type API from '.';
import { createQueryCreator } from './common';

export interface SetOpts {
  message: string;
  duration?: number;
}

export interface Headline {
  message?: string;
}

export default class HeadlineAPI {
  constructor(private api: API) {}

  get = createQueryCreator('headline.get', (_opts: void) => {
    return this.api.GET<Headline>('/headline/');
  });

  set(opts: SetOpts) {
    return this.api.POST<SetOpts, void>('/headline/', opts);
  }

  get_studio = createQueryCreator('headline.get_studio', (_opts: void) => {
    return this.api.GET<Headline>('/studio_headline/');
  });

  set_studio(opts: SetOpts) {
    return this.api.POST<SetOpts, void>('/studio_headline/', opts);
  }
}
