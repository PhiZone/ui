/* eslint-disable @typescript-eslint/no-invalid-void-type */
import type API from '.';
import type { R } from './types';

import { createQueryCreator } from './common';

export interface Headline {
  headline: string | null;
}

export default class HeadlineAPI {
  constructor(private api: API) {}

  get = createQueryCreator('headline.get', (_opts: void): R<Headline> => {
    return this.api.GET('/headline');
  });

  getStudio = createQueryCreator('headline.getStudio', (_opts: void): R<Headline> => {
    return this.api.GET('/studio/headline');
  });
}
