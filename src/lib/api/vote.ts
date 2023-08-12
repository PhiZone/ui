import type { VoteDto } from '$lib/models';
import {
  createQueryCreator,
  stringifyListOpts,
  type ListOptsBase,
  type ResponseDto,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order?: 'ownerId' | 'score' | 'rating';
  // id?: number | number[];
  // chart?: number | number[];
  // user?: number | number[];
  // highest_total?: number;
  // lowest_total?: number;
  // highest_arrangement?: number;
  // lowest_arrangement?: number;
  // highest_feel?: number;
  // lowest_feel?: number;
  // highest_vfx?: number;
  // lowest_vfx?: number;
  // highest_creativity?: number;
  // lowest_creativity?: number;
  // highest_concord?: number;
  // lowest_concord?: number;
  // highest_impression?: number;
  // lowest_impression?: number;
}

// info
export interface InfoOpts {
  id: string;
}

// vote
export interface VoteOpts {
  id: string;
  arrangement: number;
  feel: number;
  visualEffects: number;
  creativity: number;
  concord: number;
  impression: number;
}

// unvote
export interface UnvoteOpts {
  id: string;
}

export default class VoteAPI {
  constructor(private api: API) {}

  // list = createQueryCreator('vote.list', (opts: ListOpts) => {
  //   return this.api.GET<ResponseDto<Vote>>('/votes?' + stringifyListOpts(opts));
  // });

  listAll = createQueryCreator('vote.listAll', (opts: InfoOpts & ListOpts) => {
    return this.api.GET<ResponseDto<VoteDto[]>>(
      `/charts/${opts.id}/votes?` + stringifyListOpts(opts, true)
    );
  });

  // info = createQueryCreator('vote.info', (opts: InfoOpts) => {
  //   return this.api.GET<Vote>(`/votes/${opts.id}`);
  // });

  vote(opts: VoteOpts) {
    return this.api.POST<VoteOpts, void>(`/charts/${opts.id}/votes`, opts);
  }

  unvote(opts: InfoOpts) {
    return this.api.DELETE<void>(`/charts/${opts.id}/votes`);
  }
}
