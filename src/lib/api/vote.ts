import { createQueryCreator, stringifyFilter } from './common';
import type { FilterBase, R } from './types';
import type API from '.';
import VolunteerVoteAPI from './vote.volunteer';

export interface VoteDto {
  arrangement: number;
  chartId: string;
  concord: number;
  creativity: number;
  dateCreated: Date;
  gameplay: number;
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
  rangeId?: string[];
  rangeOwnerId?: number[];
}

// create
export interface CreateOpts {
  chartId: string;
  arrangement: number;
  gameplay: number;
  visualEffects: number;
  creativity: number;
  concord: number;
  impression: number;
}

// delete
export interface DeleteOpts {
  chartId: string;
}

export default class VoteAPI {
  constructor(private api: API) {
    this.volunteer = new VolunteerVoteAPI(api);
  }

  listAll = createQueryCreator(
    'vote.listAll',
    ({ chartId, ...rest }: Filter): R<VoteDto[]> =>
      this.api.GET(`/charts/${chartId}/votes?` + stringifyFilter(rest, true)),
  );

  create({ chartId, ...rest }: CreateOpts): R {
    return this.api.POST(`/charts/${chartId}/votes`, rest);
  }

  delete({ chartId }: DeleteOpts): R {
    return this.api.DELETE(`/charts/${chartId}/votes`);
  }

  volunteer;
}
