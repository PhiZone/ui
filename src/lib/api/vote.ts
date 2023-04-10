import type { Vote } from '$lib/models';
import queryString from 'query-string';
import { createQueryCreator, type ListOptsBase, type PagedResults } from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?:
    | 'id'
    | 'chart'
    | 'user'
    | 'total'
    | 'arrangement'
    | 'feel'
    | 'vfx'
    | 'innovativeness'
    | 'concord'
    | 'impression';
  id?: number | number[];
  chart?: number | number[];
  user?: number | number[];
  highest_total?: number;
  lowest_total?: number;
  highest_arrangement?: number;
  lowest_arrangement?: number;
  highest_feel?: number;
  lowest_feel?: number;
  highest_vfx?: number;
  lowest_vfx?: number;
  highest_innovativeness?: number;
  lowest_innovativeness?: number;
  highest_concord?: number;
  lowest_concord?: number;
  highest_impression?: number;
  lowest_impression?: number;
}

// info
export interface InfoOpts {
  id: number;
}

// vote
export interface VoteOpts {
  chart: number;
  arrangement: number;
  feel: number;
  visual_effects: number;
  innovativeness: number;
  concord: number;
  impression: number;
}

// unvote
export interface UnvoteOpts {
  id: number;
}

export default class VoteAPI {
  constructor(private api: API) {}

  list = createQueryCreator('vote.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Vote>>('/votes/?' + queryString.stringify(opts));
  });

  listAll = createQueryCreator('vote.listAll', (opts: ListOpts) => {
    return this.api.GET<Vote[]>('/votes/?pagination=0&' + queryString.stringify(opts));
  });

  info = createQueryCreator('vote.info', (opts: InfoOpts) => {
    return this.api.GET<Vote>(`/votes/${opts.id}`);
  });

  vote(opts: VoteOpts) {
    return this.api.POST<VoteOpts, Vote>('/votes/', opts);
  }

  unvote(opts: UnvoteOpts) {
    return this.api.DELETE<UnvoteOpts, void>(`/votes/${opts.id}/`);
  }
}
