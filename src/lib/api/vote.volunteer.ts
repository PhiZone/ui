import { createQueryCreator, stringifyFilter } from './common';
import type { FilterBase, R } from './types';
import type API from '.';

export interface VolunteerVoteDto {
  chartId: string;
  dateCreated: string;
  id: string;
  message: string | null;
  ownerId: number;
  score: number;
  suggestedDifficulty: number;
}

// list
export interface Filter extends FilterBase {
  chartId: string;
}

// create
export interface CreateOpts {
  chartId: string;
  message: string | null;
  score: number;
  suggestedDifficulty: number;
}

// delete
export interface DeleteOpts {
  chartId: string;
}

export default class VolunteerVoteAPI {
  constructor(private api: API) {}

  listAll = createQueryCreator(
    'voluteer.vote.listAll',
    ({ chartId, ...rest }: Filter): R<VolunteerVoteDto[]> =>
      this.api.GET(`/studio/charts/${chartId}/votes?` + stringifyFilter(rest, true)),
  );

  create({ chartId, ...rest }: CreateOpts): R {
    return this.api.POST(`/studio/charts/${chartId}/votes`, rest);
  }

  delete({ chartId }: DeleteOpts): R {
    return this.api.DELETE(`/studio/charts/${chartId}/votes`);
  }
}
