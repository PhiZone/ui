import type { Chart } from '$lib/models';
import queryString from 'query-string';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import ChartSubmissionAPI from './chart.submission';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?:
    | 'id'
    | 'song'
    | 'owner'
    | 'charter'
    | 'level'
    | 'ranked'
    | 'difficulty'
    | 'note_count'
    | 'score'
    | 'rating';
  id?: number | number[];
  song?: number | number[];
  owner?: number | number[];
  level?: string | string[];
  charter?: string;
  description?: string;
  ranked?: number;
  lowest_difficulty?: number;
  highest_difficulty?: number;
  lowest_note_count?: number;
  highest_note_count?: number;
  lowest_score?: number;
  highest_score?: number;
  lowest_rating?: number;
  highest_rating?: number;
  query_song?: number;
  query_owner?: number;
}

// info
export interface InfoOpts {
  id: number;
  query_song?: number;
  query_owner?: number;
}

export default class ChartAPI {
  constructor(private api: API) {
    this.submission = new ChartSubmissionAPI(this.api);
  }

  list = createQueryCreator('chart.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<Chart>>('/charts/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('chart.listAll', (opts: ListOpts) => {
    return this.api.GET<Chart[]>('/charts/?' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('chart.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<Chart>(`/charts/${id}/?` + queryString.stringify(rest));
  });

  submission;
}
