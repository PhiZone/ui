import { createQueryCreator, stringifyFilter } from './common';
import type { FilterBase, R } from './types';
import type API from '.';

export interface VoteDto {
  arrangement: number;
  chartId: string;
  concord: number;
  creativity: number;
  dateCreated: Date;
  feel: number;
  id: string;
  impression: number;
  multiplier: number;
  ownerId: number;
  total: number;
  visualEffects: number;
}

// list
export interface Filter extends FilterBase {
  chartId: string;
  order?: 'ownerId' | 'score' | 'rating';
}

// vote
export interface VoteOpts {
  chartId: string;
  arrangement: number;
  feel: number;
  visualEffects: number;
  creativity: number;
  concord: number;
  impression: number;
}

// unvote
export interface UnvoteOpts {
  chartId: string;
}

export default class VoteAPI {
  constructor(private api: API) {}

  listAll = createQueryCreator(
    'vote.listAll',
    ({ chartId, ...rest }: Filter): R<VoteDto[]> =>
      this.api.GET(`/charts/${chartId}/votes?` + stringifyFilter(rest, true)),
  );

  vote({ chartId, ...rest }: VoteOpts): R {
    return this.api.POST(`/charts/${chartId}/votes`, rest);
  }

  unvote({ chartId }: UnvoteOpts): R {
    return this.api.DELETE(`/charts/${chartId}/votes`);
  }
}
