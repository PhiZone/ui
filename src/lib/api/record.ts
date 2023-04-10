import queryString from 'query-string';
import type { PlayRecord } from '$lib/models';
import {
  stringifyListOpts,
  type ListOptsBase,
  type PagedResults,
  createQueryCreator,
} from './common';
import type API from '.';

// list
export interface ListOpts extends ListOptsBase {
  order_by?: 'id' | 'chart' | 'player' | 'score' | 'acc' | 'rks' | 'time';
  id?: number | number[];
  chart?: number | number[];
  player?: number | number[];
  query_player?: number;
  query_song?: number;
  query_owner?: number;
}

// info
export interface InfoOpts {
  id: number;
  query_player?: number;
  query_song?: number;
  query_owner?: number;
}

// upload
// skipped

// list15
export interface List15Opts {
  chart?: number;
}

export default class RecordAPI {
  constructor(private api: API) {}

  list = createQueryCreator('record.list', (opts: ListOpts) => {
    return this.api.GET<PagedResults<PlayRecord>>('/records/?' + stringifyListOpts(opts));
  });

  listAll = createQueryCreator('record.listAll', (opts: ListOpts) => {
    return this.api.GET<PlayRecord[]>('/records/?pagination=0&' + stringifyListOpts(opts, true));
  });

  info = createQueryCreator('record.info', (opts: InfoOpts) => {
    const { id, ...rest } = opts;
    return this.api.GET<PlayRecord>(`/records/${id}/?` + queryString.stringify(rest));
  });

  list15 = createQueryCreator('record.list15', (opts: List15Opts) => {
    return this.api.GET<PlayRecord[]>('/records/list15/?' + queryString.stringify(opts));
  });
}
